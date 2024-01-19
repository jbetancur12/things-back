import mongoose from 'mongoose'
const Schema = mongoose.Schema

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Name is required'
    },
    typeCustomer: {
      type: {
        enum: ['natural', 'company']
      }
    },
    customerKey: {
      type: String,
      trim: true
    },
    IdCustomer: {
      type: String
    },
    email: {
      // name: {
      type: String,
      trim: true,
      unique: 'Email already exists',
      match: [/.+@.+\..+/, 'Please fill a valid email address'],
      required: 'Email is required'
    },
    phone: {
      type: String,
      trim: true,
      required: 'Phone is required'
    },
    lang: {
      type: String,
      enum: ['en', 'de', 'es']
      // required: 'Language is required',
    },
    country: {
      type: String,
      trim: true,
      required: 'Country is required'
    },
    city: {
      type: String,
      trim: true,
      required: 'City is required'
    },
    address1: {
      type: String,
      trim: true,
      required: 'Address is required'
    },
    address2: {
      type: String,
      trim: true
    },
    zipcode: {
      type: Number,
      trim: true
      // required: 'ZipCode is required'
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    controllers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Controller'
      }
    ],
    templates: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Template'
      }
    ],
    variables: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Variable'
      }
    ],
    activeSubscription: {
      isActive: {
        type: Boolean,
        default: false // Valor por defecto es false
      },
      startDate: {
        type: Date
        // required: 'Fecha de Inicio requerida'
      },
      endDate: {
        type: Date
        // required: 'Fecha de FIn requerida'
      }
    },
    trialPeriod: {
      isOnTrial: {
        type: Boolean,
        default: false // Valor por defecto es false
      },
      trialStartDate: {
        type: Date
        // required: 'Fecha de Inicio requerida'
      },
      trialEndDate: {
        type: Date
        // required: 'Fecha de Fin requerida'
      }
    }
  },
  { timestamps: true }
)

// CustomerSchema.method('toJSON', function () {
//     const { __v, _id, ...object } = this.toObject()
//     object.id = _id
//     return object
// })

export default mongoose.model('Customer', CustomerSchema)
