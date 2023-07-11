import extend from 'lodash/extend.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'

const Customer = db.customer

/**
 * Middleware to handle requests for a specific customer
 */
const customerByID = async (req, res, next, id) => {
  try {
    const customer = await Customer.findById(id).populate('users')
    if (!customer) {
      return res.status(400).json({
        error: 'Customer not found'
      })
    }
    req.customer = customer
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve customer'
    })
  }
}

const find = async (req, res) => {
  const customer = req.customer
  try {
    res.json(customer)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * List all customers or filter by query parameters
 */
const list = async (req, res) => {
  try {
    if (!req.query.name) {
      const customers = await Customer.find({ ...req.query })
      res.json(customers)
    } else {
      const name = req.query.name
      const customers = await Customer.find({
        name: new RegExp(name, 'i')
      }).exec()
      res.json(customers)
    }
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Create a new customer
 */
const create = async (req, res) => {
  const customer = new Customer(req.body)
  try {
    await customer.save()
    return res.status(200).json(customer)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Update an existing customer
 */
const update = async (req, res) => {
  try {
    let customer = req.customer
    customer = extend(customer, req.body)
    customer.updated = Date.now
    await customer.save()
    res.json(customer)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Delete a customer
 */
const remove = async (req, res) => {
  try {
    const customer = req.customer
    const deletedCustomer = await customer.remove()
    res.json(deletedCustomer)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { list, create, remove, update, customerByID, find }
