import dbErrorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'

const LogsActuator = db.logsActuator
const Customer = db.customer

/**
 * Middleware to handle requests for a specific logsActuator
 */
const getAllByCustomer = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 10

  try {
    const totalLogs = await LogsActuator.countDocuments({
      customer: req.params.id
    })
    const logsActuator = await LogsActuator.find({
      customer: req.params.id
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize) // Saltar resultados según la página y tamaño de página
      .limit(pageSize) // Limitar la cantidad de resultados por página

    res.json({
      total: totalLogs,
      logs: logsActuator
    })
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
