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
    variable: {
      type: Schema.Types.ObjectId,
      ref: 'Variable',
      required: 'Variable is required'
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
