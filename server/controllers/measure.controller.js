import errorHandler from '../helpers/dbErrorHandler.js'
import mongoose from 'mongoose'
import extend from 'lodash/extend.js'

const Measure = mongoose.model('Measure')

const getByPeriod = async (req, res) => {
  try {
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
              unit: 'minute',
              binSize: 15
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
