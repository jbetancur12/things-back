import crypto from 'crypto'
import mongoose from 'mongoose'
import Customer from './customer.model.js'

// const rolesValidos = {
//   values: ['ADMIN_ROLE', 'USER_ROLE'],
//   message: '{VALUE} no es un rol válido'
// }

const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: 'FirstName is required'
  },
  lastName: {
    type: String,
    trim: true,
    required: 'Last Name is required'
  },
  userName: {
    type: String,
    trim: true
    // required: 'userName is required',
  },
  email: {
    // name: {
    type: String,
    trim: true,
    unique: 'Email already exists',
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
    required: 'Email is required'
    // },
    // verified: {
    //   type: Boolean,
    //   default: false
    // }
  },
  verified: {
    type: Boolean,
    default: false,
    required: true
  },
  verificationCode: {
    type: String
  },
  lang: {
    type: String,
    enum: ['en', 'de', 'es']
    // required: 'Language is required',
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }
  ],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  otpCode: {
    type: String
  },
  hashed_password: {
    type: String,
    required: 'Password is required'
  },
  salt: String,
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date
})

UserSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },
  encryptPassword: function (password) {
    if (!password) return ''
    try {
      return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  },
  createVerificationCode: function () {
    const verificationCode = crypto.randomBytes(32).toString('hex')

    const hashedVerificationCode = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex')

    return { verificationCode, hashedVerificationCode }
  }
}

UserSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject()
  object.id = _id
  return object
})

UserSchema.path('hashed_password').validate(function (v) {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Password is required')
  }
}, null)

UserSchema.pre('remove', async function (next) {
  const user = this
  // Encuentra todos los clientes que hacen referencia a esta user y elimínala de su colección "users"
  const customers = await Customer.find({ users: user._id })
  for (const customer of customers) {
    const index = customer.users.indexOf(user._id)
    if (index !== -1) {
      customer.users.splice(index, 1)
      await customer.save()
    }
  }

  next()
})

export default mongoose.model('User', UserSchema)
