import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import config from '../../config/config.js'

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiryDate: Date
})

RefreshTokenSchema.statics.createToken = async function (user) {
  const expiredAt = new Date()

  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration)

  const _token = uuidv4()

  const _object = new this({
    token: _token,
    user: user._id,
    expiryDate: expiredAt.getTime()
  })

  const refreshToken = await _object.save()

  return refreshToken.token
}

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime()
}

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema)

export default RefreshToken
