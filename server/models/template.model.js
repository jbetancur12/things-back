import mongoose from 'mongoose'
const Schema = mongoose.Schema

const TemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: 'Name is required'
    },
    descriptiom: {
      type: String
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: 'Customer is required'
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

export default mongoose.model('Template', TemplateSchema)
