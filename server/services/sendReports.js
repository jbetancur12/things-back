// sendEmails.js
import ExcelJS from 'exceljs'
import db from '../models/index.js'
import cron from 'node-cron'
import { getVariableNames } from '../controllers/measure.controller.js'
import Email from '../helpers/email.js'

const Customer = db.customer
const Measure = db.measure

async function enviarCorreos () {
  try {
    const currentDate = new Date()
    const lastWeek = new Date(currentDate)
    lastWeek.setDate(currentDate.getDate() - 7)

    const last30inutes = new Date(currentDate)
    last30inutes.setMinutes(currentDate.getMinutes() - 30)

    const customers = await Customer.find()
    const query = {
      timestamp: {
        $gte: last30inutes,
        $lte: currentDate
      }
    }

    customers.forEach(async (customer) => {
      query.customer = customer._id

      const measures = await Measure.find(query)

      if (measures.length === 0) return

      const variableNames = await getVariableNames(
        measures.map((measure) => measure.variable)
      )

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Medidas')

      worksheet.addRow(['variable', 'value', 'createdAt'])

      measures.forEach((measure) => {
        const variableName =
          variableNames[measure.variable] || 'Nombre no encontrado'
        measure.createdAt = measure.createdAt.toLocaleString()
        worksheet.addRow([variableName, measure.value, measure.createdAt]) // Ajusta los campos según tu modelo Measure
      })

      const buffer = await workbook.xlsx.writeBuffer()

      const user = {
        firstName: customer.name,
        email: customer.email
      }

      const emailInstance = new Email(user)

      await emailInstance.sendExcelAttachment('archivo_adjunto.xlsx', buffer)
    })

    console.log('Correos electrónicos enviados con éxito.')
  } catch (error) {
    console.error('Error al enviar correos electrónicos:', error)
  }
}

cron.schedule('0,30 * * * *', async () => {
  await enviarCorreos()
  console.log('Tarea semanal de enviar correos ejecutada con éxito.')
})
