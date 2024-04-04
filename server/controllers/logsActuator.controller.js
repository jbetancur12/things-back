import dbErrorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'

const LogsActuator = db.logsActuator
const Customer = db.customer

/**
 * Middleware to handle requests for a specific logsActuator
 */
const getAllByCustomer = async (req, res) => {
  try {
    const logsActuator = await LogsActuator.find({ customer: req.params.id })

    res.json(logsActuator)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const create = async (req, res) => {
  try {
    const logsActuator = new LogsActuator(req.body)
    await logsActuator.save()

    await Customer.findByIdAndUpdate(
      req.body.customer,
      { $push: { logsActuactors: logsActuator.id } },
      { new: true, useFindAndModify: false }
    )

    res.status(201).json(logsActuator)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

export default { getAllByCustomer, create }
