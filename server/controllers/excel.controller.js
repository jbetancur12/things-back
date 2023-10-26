import xlsx from 'xlsx'
import db from '../models/index.js'

const Template = db.template
const Customer = db.customer
const Variable = db.variable

const upload = async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No se ha proporcionado ningún archivo' })
    return
  }

  try {
    // Leer el archivo Excel
    const workbook = xlsx.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 })

    const [, ...rows] = data

    // Guardar las variables en MongoDB
    const variables = rows
      .filter((row) => row.some((cell) => cell !== undefined && cell !== null))
      .map((row) => {
        const [
          virtualPin,
          name,
          sensorType,
          unit,
          typePin,
          customer,
          template
        ] = row
        return {
          virtualPin,
          name,
          sensorType,
          unit,
          typePin,
          customer,
          template
        }
      })

    const savedVariables = await Variable.insertMany(variables)

    // Crear asociaciones con Template y Customer
    for (const variable of savedVariables) {
      if (variable.template) {
        await Template.findByIdAndUpdate(
          variable.template,
          { $push: { variables: variable._id } },
          { new: true, useFindAndModify: false }
        )
      }
      if (variable.customer) {
        await Customer.findByIdAndUpdate(
          variable.customer,
          { $push: { variables: variable._id } },
          { new: true, useFindAndModify: false }
        )
      }
    }

    res
      .status(200)
      .json({ message: 'Archivo cargado exitosamente', data: savedVariables })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export default { upload }
