import errorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'
import extend from 'lodash/extend.js'

const Template = db.template
const Customer = db.customer
const Variable = db.variable

/**
 * Middleware to handle requests for a specific variable
 */
const variableByID = async (req, res, next, id) => {
  try {
    const variable = await Variable.findById(id)
    if (!variable) {
      return res.status(400).json({
        error: 'Variable not found'
      })
    }
    req.variable = variable
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve variable'
    })
  }
}

const find = async (req, res) => {
  const variable = req.variable
  try {
    res.json(variable)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * List all variables or filter by query parameters
 */
const list = async (req, res) => {
  try {
    const variables = await Variable.find({ ...req.query })
    res.json(variables)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Create a new variable
 */
const create = async (req, res) => {
  try {
    const variable = new Variable(req.body)
    await variable.save()

    const template = variable.template
    await Template.findByIdAndUpdate(
      template,
      { $push: { variables: variable._id } },
      { new: true, useFindAndModify: false }
    )

    const customer = variable.customer
    await Customer.findByIdAndUpdate(
      customer,
      { $push: { variables: variable._id } },
      { new: true, useFindAndModify: false }
    )

    return res.status(200).json({
      message: 'Variable Successfully created!',
      data: variable
    })
  } catch (err) {
    return res.status(400).json({
      error: err
    })
  }
}

/**
 * Update an existing variable
 */
const update = async (req, res) => {
  try {
    let variable = req.variable
    variable = extend(variable, req.body)
    variable.updated = Date.now
    await variable.save()
    res.json(variable)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Delete a variable
 */
const remove = async (req, res) => {
  try {
    const variable = req.variable
    const deletedCustomer = await variable.remove()
    res.json(deletedCustomer)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { list, create, remove, update, variableByID, find }
