import mongoose from 'mongoose'

import Customer from './customer.model.js'
const Schema = mongoose.Schema

const ControllerSchema = new Schema({
  name: {
    type: String,
    required: 'Name is required'
  },
  controllerId: String,
  lastPingTime: {
    type: Date,
    default: Date.now // Establece la fecha actual como valor por defecto
  },
  connected: {
    type: Boolean,
    default: true // Establece el valor por defecto como `true` (conectado)
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: 'Customer is required'
  }
})

ControllerSchema.pre('remove', async function (next) {
  const controller = this

  // Encuentra todos los clientes que hacen referencia a esta controller y elimínala de su colección "controllers"
  const customers = await Customer.find({ controllers: controller._id })
  for (const customer of customers) {
    const index = customer.controllers.indexOf(controller._id)
    if (index !== -1) {
      customer.controllers.splice(index, 1)
      await customer.save()
    }
  }

  next()
})

export default mongoose.model('Controller', ControllerSchema)
