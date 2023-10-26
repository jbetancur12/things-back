import mongoose from 'mongoose'
import customerModel from './customer.model.js'
const Schema = mongoose.Schema

const TemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: 'Name is required'
    },
    description: {
      type: String
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: 'Customer is required'
    },
    type: {
      type: String,
      enum: ['graph', 'display', 'output']
    },
    variables: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Variable'
      }
    ]
  },
  { timestamps: true }
)

TemplateSchema.pre('deleteOne', { document: true }, async function (next) {
  try {
    await mongoose.model('Variable').deleteMany({ template: this._id })
    await mongoose
      .model('Measure')
      .deleteMany({ variable: { $in: this.variables } })
    next()
  } catch (error) {
    next()
  }
})

TemplateSchema.pre('remove', async function (next) {
  const template = this
  // Encuentra todos los clientes que hacen referencia a esta template y elimínala de su colección "templates"
  const customers = await customerModel.find({ templates: template._id })
  for (const customer of customers) {
    const index = customer.templates.indexOf(template._id)
    if (index !== -1) {
      customer.templates.splice(index, 1)
      await customer.save()
    }
  }

  next()
})

export default mongoose.model('Template', TemplateSchema)
