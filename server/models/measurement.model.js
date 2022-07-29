import mongoose from 'mongoose'

const Schema = mongoose.Schema

const MeasurementSchema = new Schema(
  {
    temperature: {
      type: Number
    },
    humidity: {
      type: Number
    }
  },
  { timestamps: true }
)

export default mongoose.model('Measurement', MeasurementSchema)
