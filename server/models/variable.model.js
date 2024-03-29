import mongoose from 'mongoose'

import Controller from './controller.model.js'
import Customer from './customer.model.js'
const Schema = mongoose.Schema

const VariableSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Name is required'
    },
    sensorType: {
      type: String,
      trim: true,
      required: 'Variable is required'
    },
    unit: {
      type: String,
      trim: true,
      required: 'Unit is required'
    },
    typePin: {
      type: String,
      trim: true
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: 'Customer is required'
    },

    template: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: 'Template is required'
    },
    virtualPin: {
      type: Number,
      required: 'Virtual Pin is required',
      min: 1,
      max: 999
    },
    measures: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Measure'
      }
    ],
    controller: {
      type: Schema.Types.ObjectId,
      ref: 'Controller',
      required: 'Controlador es requerido'
    }
  },
  { timestamps: true }
)

VariableSchema.pre('remove', async function (next) {
  const variable = this
  // Encuentra todos los clientes que hacen referencia a esta variable y elimínala de su colección "variables"
  const customers = await Customer.find({ variables: variable._id })
  const controllers = await Controller.find({ variables: variable._id })
  for (const customer of customers) {
    const index = customer.variables.indexOf(variable._id)
    if (index !== -1) {
      customer.variables.splice(index, 1)
      await customer.save()
    }
  }

  for (const controller of controllers) {
    const index = controller.variables.indexOf(variable._id)
    if (index !== -1) {
      controller.variables.splice(index, 1)
      await controller.save()
    }
  }

  next()
})

export default mongoose.model('Variable', VariableSchema)
