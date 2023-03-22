import mongoose from 'mongoose'
import crypto from 'crypto'

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

export default mongoose.model('User', UserSchema)
