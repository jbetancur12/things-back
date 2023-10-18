import dbErrorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'
const Role = db.role

const list = async (req, res) => {
  try {
    const roleName = req.query.name // Obtiene el valor del campo "name" desde req.query
    const regex = new RegExp(roleName, 'i') // 'i' indica que la expresión regular es insensible a mayúsculas y minúsculas
    const roles = await Role.find({ name: { $regex: regex } })
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
