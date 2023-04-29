import mongoose from 'mongoose'
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

export default mongoose.model('Template', TemplateSchema)
