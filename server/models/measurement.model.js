import mongoose from 'mongoose'

const Schema = mongoose.Schema

const MeasurementSchema = new Schema(
  {
    temperature: {
      type: Number
    },
    humidity: {
      type: Number
    },
    mac: {
      type: String
    }
  },
  { timestamps: true }
)

export default mongoose.model('Measurement', MeasurementSchema)
