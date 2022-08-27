import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import config from './../../config/config.js'

const signin = async (req, res) => {
  try {
    const user = await User.findOne({ 'email.name': req.body.email })
    if (!user) return res.status('401').json({ error: 'User not found' })

    if (!user.authenticate(req.body.password)) {
      return res
        .status('401')
        .send({ error: "Email and password don't match." })
    }

    const token = jwt.sign(
      { exp: Math.floor(Date.now() / 1000) + 60 * 60, _id: user._id },
      config.jwtSecret
    )

    res.cookie('t', token, { expire: new Date() + 9999 })

    return res.json({
      token,
      user
    })
  } catch (err) {
    return res.status('401').json({ error: 'Could not sign in' })
  }
}

const signout = (req, res) => {
  res.clearCookie('t')
  return res.status('200').json({
    message: 'signed out'
  })
}

const requireSignin = expressjwt({
  secret: config.jwtSecret,
  userProperty: 'auth',
  algorithms: ['sha1', 'RS256', 'HS256']
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id === req.auth._id
  if (!authorized) {
    return res.status(403).json({
      error: 'User is not authorized'
    })
  }
  next()
}

export default { signin, signout, requireSignin, hasAuthorization }
