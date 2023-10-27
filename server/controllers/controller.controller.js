import dbErrorHandler from '../helpers/dbErrorHandler.js'
import db from '../models/index.js'

const Controller = db.controller
const Customer = db.customer

/**
 * Middleware to handle requests for a specific controller
 */
const controllerByID = async (req, res, next, id) => {
  try {
    const controller = await Controller.findById(id)
    if (!controller) {
      return res.status(400).json({
        error: 'Controller not found'
      })
    }
    req.controller = controller
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve controller'
    })
  }
}

const list = async (req, res) => {
  try {
    const controllers = await Controller.find({ ...req.query }).populate(
      'customer'
    )

    res.json(controllers)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const checkConnection = async (req, res) => {
  try {
    const controllerId = req.params.controllerId // Obtiene el ID del parámetro de la URL

    // Utiliza el método findOne para buscar el controlador por su ID
    const controller = await Controller.findOne({ controllerId })

    if (controller) {
      controller.lastPingTime = Date.now()

      // Actualiza el estado connected solo si no está conectado
      if (!controller.connected) {
        controller.connected = true
      }

      // Guarda los cambios en la base de datos
      await controller.save()

      // Controlador encontrado, puedes enviarlo como respuesta al cliente
      res.status(200).json(controller)
    } else {
      // Si no se encuentra ningún controlador con ese ID, puedes enviar una respuesta 404.
      res.status(404).json({ message: 'Controlador no encontrado' })
    }
  } catch (error) {
    console.error('Error al buscar el controlador por ID:', error)
    // Maneja el error y envía una respuesta de error al cliente si es necesario.
    res
      .status(500)
      .json({ message: 'Error al buscar o actualizar el controlador por ID' })
  }
}

const crearControlador = async (req, res) => {
  try {
    // Genera un código alfanumérico único de 8 caracteres
    const nuevoCodigo = generarCodigoAleatorio(8)
    const { customer, name } = req.body

    // Crea una nueva instancia del modelo Controller
    const nuevoControlador = new Controller({
      controllerId: nuevoCodigo, // Asigna el código alfanumérico único
      lastPingTime: Date.now(), // Se establecerá automáticamente con la fecha actual
      connected: false, // Por defecto, se establece como conectado
      customer,
      name
    })

    // Guarda la nueva instancia en la base de datos
    await nuevoControlador.save()

    await Customer.findByIdAndUpdate(
      customer,
      { $push: { controllers: nuevoControlador._id } },
      { new: true, useFindAndModify: false }
    )

    // Puedes enviar una respuesta al cliente indicando que se ha creado el controlador con éxito.
    res
      .status(201)
      .json({ message: 'Controlador creado con éxito', data: nuevoControlador })
  } catch (error) {
    console.error('Error al crear el controlador:', error)
    // Maneja el error y envía una respuesta de error al cliente si es necesario.
    res.status(500).json({ message: 'Error al crear el controlador' })
  }
}

const remove = async (req, res) => {
  try {
    const controller = await Controller.findById(req.controller._id)
    await controller.remove()
    // const deletedCustomer = await controller.remove()
    res.status(200).json({ message: 'Controller deleted', data: controller })
  } catch (err) {
    return res.status(400).json({
      error: err
    })
  }
}

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

export default {
  checkConnection,
  crearControlador,
  remove,
  controllerByID,
  list
}
