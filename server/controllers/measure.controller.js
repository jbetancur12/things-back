import errorHandler from '../helpers/dbErrorHandler.js'
import mongoose from 'mongoose'
import extend from 'lodash/extend.js'

const Measure = mongoose.model('Measure')

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

export default { list, create, remove, update, measureByID, find }
