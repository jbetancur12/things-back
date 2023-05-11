import mongoose from 'mongoose'
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
      max: 100
    },
    measures: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Measure'
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('Variable', VariableSchema)
