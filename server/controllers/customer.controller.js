import extend from 'lodash/extend.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'

const Customer = db.customer

function generarCodigoAleatorio (longitud) {
  const caracteres =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let codigo = ''

  for (let i = 0; i < longitud; i++) {
    const caracterAleatorio = caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    )

    // Asegurarse de que el carácter no se repita
    if (!codigo.includes(caracterAleatorio)) {
      codigo += caracterAleatorio
    } else {
      i-- // Repetir la iteración para obtener un carácter único
    }
  }

  return codigo
}

/**
 * Middleware to handle requests for a specific customer
 */
const customerByID = async (req, res, next, id) => {
  try {
    const customer = await Customer.findById(id)
      .populate('users')
      .populate('controllers')
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
  customer.customerKey = generarCodigoAleatorio(3)
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
