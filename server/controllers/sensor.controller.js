import Measurement from '../models/measurement.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import excelJS from 'exceljs'

const getByPeriod = async (req, res) => {
  try {
    const measures = await Measurement.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
              }
            },
            { mac: req.query.mac }
          ]
        }
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$createdAt',
              unit: req.query.unit,
              binSize: Number(req.query.period)
            }
          },
          averageT: { $avg: '$temperature' },
          averageH: { $avg: '$humidity' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json(measures)
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const getMaxMin = async (req, res) => {
  try {
    const maxMin = await Measurement.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$createdAt',
              unit: req.query.unit,
              binSize: Number(req.query.period)
            }
          },
          maxT: { $max: '$temperature' },
          maxH: { $max: '$humidity' },
          minT: { $min: '$temperature' },
          minH: { $min: '$humidity' }
        }
      },
      { $sort: { _id: 1 } }
    ])
    res.json(maxMin)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const excel = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook()
    const worksheet = workbook.addWorksheet('Data')
    const path = './files'

    worksheet.columns = [
      { header: 'ID', key: '_id', width: 10 },
      { header: 'Temperature', key: 'temperature', width: 10 },
      { header: 'Humidity', key: 'humidity', width: 10 },
      { header: 'Mac', key: 'mac', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 }
    ]

    const meas = await Measurement.find({
      createdAt: {
        $gte: new Date('2023-03-08T02:00:00Z'),
        $lt: new Date('2023-03-08T11:00:00Z')
      }
    })

    meas.forEach((dt) => {
      dt.createdAt = dt.createdAt.toString()

      const y = {
        _id: dt._id,
        temperature: dt.temperature,
        humidity: dt.humidity,
        mac: dt.mac,
        createdAt: dt.createdAt.toString()
      }
      worksheet.addRow(y)
    })

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
    })

    await workbook.xlsx.writeFile(`${path}/users.xlsx`).then(() => {
      res.send({
        status: 'success',
        message: 'file successfully downloaded',
        path: `${path}/users.xlsx`
      })
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { getByPeriod, getMaxMin, excel }
