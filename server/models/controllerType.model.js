import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ControllerTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: 'Name is required'
    },
    controllers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Controller'
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('ControllerType', ControllerTypeSchema)
