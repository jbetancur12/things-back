import extend from 'lodash/extend.js'
import mongoose from 'mongoose'
import errorHandler from '../helpers/dbErrorHandler.js'

const Measure = mongoose.model('Measure')

const getByPeriod = async (req, res) => {
  try {
    const startTime = performance.now()

    const startDate = new Date(req.query.startDate)
    const endDate = new Date(req.query.endDate)
    const timeDiff = endDate - startDate // Diferencia de tiempo en milisegundos
    console.log(
      '🚀 ~ file: measure.controller.js:15 ~ getByPeriod ~ timeDiff:',
      timeDiff
    )

    let unit, binSize
    if (timeDiff <= 1 * 60 * 60 * 1000) {
      unit = 'minute'
      binSize = 10
    } else if (timeDiff <= 6 * 60 * 60 * 1000) {
      unit = 'minute'
      binSize = 30
    } else if (timeDiff <= 24 * 60 * 60 * 1000) {
      // Menos de un día (24 horas) 24 h 60 min 60 seg 1000 ms
      unit = 'minute'
      binSize = 60
    } else if (timeDiff <= 7 * 24 * 60 * 60 * 1000) {
      // Menos de una semana (7 días)
      unit = 'day'
      binSize = 1
    } else {
      // Mayor a una semana
      unit = 'day'
      binSize = 7
    }

    const pipeline = [
      {
        $lookup: {
          from: 'variables',
          localField: 'variable',
          foreignField: '_id',
          as: 'variable'
        }
      },
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
              }
            },
            { template: mongoose.Types.ObjectId(req.query.template) }
          ]
        }
      },

      //   {
      //     $unwind: '$variable'
      //   },
      {
        $addFields: {
          roundedTimestamp: {
            $dateTrunc: {
              date: '$createdAt',
              unit,
              binSize
            }
          },
          numericValue: {
            $convert: { input: '$value', to: 'double', onError: 0 }
          },
          variableName: '$variable.name',
          variableUnit: '$variable.unit'
        }
      },
      {
        $group: {
          _id: {
            variableName: '$variableName',
            variableUnit: '$variableUnit',
            roundedTimestamp: '$roundedTimestamp'
          },
          avgValue: {
            $avg: '$numericValue'
          }
        }
      },
      {
        $group: {
          _id: '$_id.roundedTimestamp',
          //   names:{
          //     $push:{
          //         k : "Name",
          //         v : {"$arrayElemAt":["$_id.variableUnit",0]}
          //     }
          //   },

          units: {
            $push: {
              k: { $arrayElemAt: ['$_id.variableName', 0] },
              v: { $arrayElemAt: ['$_id.variableUnit', 0] }
            }
          },
          measurements: {
            $push: {
              k: { $arrayElemAt: ['$_id.variableName', 0] },
              // variableUnit: "$_id.variableUnit",
              v: '$avgValue'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          timestamp: '$_id',
          units: {
            $arrayToObject: '$units'
          },
          measurements: {
            $arrayToObject: '$measurements'
          }
        }
      },
      {
        $sort: {
          timestamp: 1
        }
      }
    ]

    const m = await Measure.aggregate(pipeline)

    const endTime = performance.now() // Registra el tiempo de finalización
    const duration = endTime - startTime // Calcula la duración en milisegundos

    console.log(`La consulta tomó ${duration} ms`) // Imprime la duración en la consola

    res.json(m)
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Middleware to handle requests for a specific measure
 */
const measureByID = async (req, res, next, id) => {
  try {
    const measure = await Measure.findById(id)
    if (!measure) {
      return res.status(400).json({
        error: 'Measure not found'
      })
    }
    req.measure = measure
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve measure'
    })
  }
}

const find = async (req, res) => {
  const measure = req.measure
  try {
    res.json(measure)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * List all measures or filter by query parameters
 */
const list = async (req, res) => {
  try {
    const measures = await Measure.find({ ...req.query })
    res.json(measures)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Create a new measure
 */
const create = async (req, res) => {
  const measure = new Measure(req.body)
  const virtualPinsUsed = await Measure.find({ customer: req.body.customer })
  const result = virtualPinsUsed.filter(
    (virtualPin) => virtualPin.virtualPin === req.body.virtualPin
  )

  try {
    if (result.length > 0) {
      return res.status(400).json({
        message: 'Virtual Pin already exists',
        data: measure
      })
    }

    await measure.save()

    return res.status(200).json({
      message: 'Measure Successfully created!',
      data: measure
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Update an existing measure
 */
const update = async (req, res) => {
  try {
    let measure = req.measure
    measure = extend(measure, req.body)
    measure.updated = Date.now
    await measure.save()
    res.json(measure)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Delete a measure
 */
const remove = async (req, res) => {
  try {
    const measure = req.measure
    const deletedMeasure = await measure.remove()
    res.json(deletedMeasure)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { list, create, remove, update, measureByID, find, getByPeriod }
