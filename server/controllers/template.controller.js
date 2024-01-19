import extend from 'lodash/extend.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'

const Template = db.template
const Customer = db.customer

/**
 * Middleware to handle requests for a specific template
 *
 *
 */

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

const templateByID = async (req, res, next, id) => {
  try {
    const template = await Template.findById(id)
      .populate({
        path: 'variables',
        select: '-measures -__v',
        populate: [
          {
            path: 'controller',
            select: '-measures -__v'
          }
        ]
      })
      .populate({
        path: 'customer',
        select: 'customerKey'
      })

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
  try {
    const template = new Template(req.body)
    template.templateKey = generarCodigoAleatorio(3)
    await template.save()

    const customer = template.customer
    await Customer.findByIdAndUpdate(
      customer,
      { $push: { templates: template._id } },
      { new: true, useFindAndModify: false }
    )

    return res.status(200).json({
      message: 'Template Successfully created!',
      data: template
    })
  } catch (err) {
    return res.status(400).json({
      error: err
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
    const template = await Template.findById(req.template._id)
    // await Variable.deleteMany({ _id: { $in: variableIds } });
    await template.remove()
    // const deletedCustomer = await template.remove()
    res.json(template)
  } catch (err) {
    return res.status(400).json({
      error: err
    })
  }
}

export default { list, create, remove, update, templateByID, find }
