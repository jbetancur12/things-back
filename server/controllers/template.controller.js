import errorHandler from '../helpers/dbErrorHandler.js'
import mongoose from 'mongoose'
import extend from 'lodash/extend.js'

const Template = mongoose.model('Template')

/**
 * Middleware to handle requests for a specific template
 */
const templateByID = async (req, res, next, id) => {
  try {
    const template = await Template.findById(id)
    if (!template) {
      return res.status(400).json({
        error: 'Template not found'
      })
    }
    req.template = template
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve template'
    })
  }
}

const find = async (req, res) => {
  const template = req.template
  try {
    res.json(template)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * List all templates or filter by query parameters
 */
const list = async (req, res) => {
  try {
    const templates = await Template.find({ ...req.query })
    res.json(templates)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Create a new template
 */
const create = async (req, res) => {
  const template = new Template(req.body)
  const virtualPinsUsed = await Template.find({ customer: req.body.customer })
  const result = virtualPinsUsed.filter(
    (virtualPin) => virtualPin.virtualPin === req.body.virtualPin
  )

  try {
    if (result.length > 0) {
      return res.status(400).json({
        message: 'Virtual Pin already exists',
        data: template
      })
    }

    await template.save()

    return res.status(200).json({
      message: 'Template Successfully created!',
      data: template
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Update an existing template
 */
const update = async (req, res) => {
  try {
    let template = req.template
    template = extend(template, req.body)
    template.updated = Date.now
    await template.save()
    res.json(template)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Delete a template
 */
const remove = async (req, res) => {
  try {
    const template = req.template
    const deletedCustomer = await template.remove()
    res.json(deletedCustomer)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { list, create, remove, update, templateByID, find }
