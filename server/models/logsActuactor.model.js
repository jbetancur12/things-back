import mongoose from 'mongoose'
const Schema = mongoose.Schema

const LogsActuactorSchema = new Schema(
  {
    actuactor: {
      type: String
    },
    option: {
      type: String
    },
    user: {
      type: String,
      required: 'Name is required'
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: 'Customer is required'
    }
  },
  { timestamps: true }
)

export default mongoose.model('LogsActuactor', LogsActuactorSchema)
