import db from '../models/index.js'

const ControllerType = db.controllerType

const list = async (req, res) => {
  try {
    const controllerTypes = await ControllerType.find({ ...req.query })
    return res.status(200).json(controllerTypes)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtner los tipos de controlador' })
  }
}

const create = async (req, res) => {
  try {
    const controllerType = new ControllerType(req.body)
    await controllerType.save()
    return res.status(200).json(controllerType)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el tipo decontrolador' })
  }
}

export default { create, list }
