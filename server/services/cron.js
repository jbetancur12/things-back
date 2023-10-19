import cron from 'node-cron'
import db from '../models/index.js'

const Customer = db.customer

cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date()
    const customers = await Customer.find()

    customers.forEach(async (customer) => {
      // Verificar y desactivar el período de prueba si está activo y ha expirado
      if (customer.trialPeriod.trialEndDate) {
        if (
          customer.trialPeriod.isOnTrial &&
          customer.trialPeriod.trialEndDate <= currentDate
        ) {
          customer.trialPeriod.isOnTrial = false
          customer.trialPeriod.trialEndDate = null
        }
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
      }

      await customer.save()
    })
  } catch (error) {
    console.error('Error al actualizar estados de clientes:', error)
  }
})
