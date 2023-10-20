import db from '../models/index.js'

const Customer = db.customer

const activate = async (req, res) => {
  try {
    const customerId = req.params.customerId
    const customer = await Customer.findById(customerId)

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    if (customer.activeSubscription.isActive) {
      return res
        .status(400)
        .json({ error: 'El cliente ya tiene una suscripción activa' })
    }

    // Verificar y desactivar el período de prueba si está activo
    if (customer.trialPeriod.isOnTrial) {
      customer.trialPeriod.isOnTrial = false
      customer.trialPeriod.trialEndDate = null
    }

    // Activar la suscripción
    customer.activeSubscription.isActive = true
    customer.activeSubscription.startDate = req.body.startDate // Fecha de inicio de la suscripción
    customer.activeSubscription.endDate = req.body.endDate // Fecha de fin de la suscripción
    // Calcular la fecha de finalización de la suscripción según tus reglas

    await customer.save()

    res.status(200).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Error al activar la suscripción' })
  }
}

const editSubscription = async (req, res) => {
  try {
    const customerId = req.params.customerId
    const customer = await Customer.findById(customerId)
    for (const key in req.body) {
      customer.activeSubscription[key] = req.body[key]
    }

    // customer.updated = Date.now
    await customer.save()
    res.status(200).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Error al editar la suscripción' })
  }
}

const editTrial = async (req, res) => {
  try {
    const customerId = req.params.customerId
    const customer = await Customer.findById(customerId)
    for (const key in req.body) {
      customer.trialPeriod[key] = req.body[key]
    }

    // customer.updated = Date.now
    await customer.save()
    res.status(200).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Error al editar la suscripción' })
  }
}

const trial = async (req, res) => {
  try {
    const customerId = req.params.customerId
    const customer = await Customer.findById(customerId)

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    if (customer.trialPeriod.isOnTrial) {
      return res
        .status(400)
        .json({ error: 'El cliente ya está en período de prueba' })
    }

    // Verificar y desactivar la suscripción si está activa
    if (customer.activeSubscription.isActive) {
      return res
        .status(400)
        .json({ error: 'El cliente ya tiene una suscripcion activa' })
    }

    // Activar el período de prueba
    customer.trialPeriod.isOnTrial = true
    customer.trialPeriod.trialStartDate = req.body.startDate // Fecha de inicio del período de prueba
    customer.trialPeriod.trialEndDate = req.body.endDate // Fecha de din del período de prueba
    // Calcular la fecha de finalización del período de prueba según tus reglas

    await customer.save()

    res.status(200).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Error al activar el período de prueba' })
  }
}

const checkSuscriptions = async (req, res) => {
  try {
    const currentDate = new Date()
    const customerId = req.params.customerId
    const customer = await Customer.findById(customerId)

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    if (customer.trialPeriod.trialEndDate) {
      if (
        customer.trialPeriod.isOnTrial &&
        customer.trialPeriod.trialEndDate <= currentDate
      ) {
        customer.trialPeriod.isOnTrial = false
        customer.trialPeriod.trialEndDate = null
      }
    } else {
      customer.trialPeriod.isOnTrial = false
      customer.trialPeriod.trialEndDate = null
    }

    // Verificar y desactivar la suscripción si está activa y ha expirado
    if (customer.activeSubscription.endDate) {
      if (
        customer.activeSubscription.isActive &&
        customer.activeSubscription.endDate <= currentDate
      ) {
        customer.activeSubscription.isActive = false
        customer.activeSubscription.endDate = null
      }
    } else {
      customer.activeSubscription.isActive = false
      customer.activeSubscription.endDate = null
    }

    await customer.save()
    res.status(200).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Error al revisar' })
  }
}

export default {
  activate,
  trial,
  checkSuscriptions,
  editSubscription,
  editTrial
}
