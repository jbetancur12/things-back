import mongoose from 'mongoose'
const Schema = mongoose.Schema

const MeasureSchema = new Schema(
  {
    value: {
      type: String,
      required: 'Name is required'
    },
    virtualPin: {
      type: String
    },
    timestamp: {
      type: Date
    },
    variable: {
      type: Schema.Types.ObjectId,
      ref: 'Variable',
      required: 'Customer is required'
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
    }
  },
  { timestamps: true }
)

export default mongoose.model('Measure', MeasureSchema)
