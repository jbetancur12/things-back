import Measurement from '../models/measurement.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const getByPeriod = async (req, res) => {
  try {
    const measures = await Measurement.aggregate([
      {
        $group: {
          _id: {
            $dateTrunc: { date: '$createdAt', unit: 'minute', binSize: 15 }
          },
          averageT: { $avg: '$temperature' },
          averageH: { $avg: '$humidity' }
        }
      }
    ])
    res.json(measures)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { getByPeriod }
