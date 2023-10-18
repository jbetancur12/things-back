import dbErrorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'
const Role = db.role

const list = async (req, res) => {
  try {
    const roles = await Role.find({ ...req.query })
    res.json(roles)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

export default {
  list
}
