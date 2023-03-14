import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import config from './../../config/config.js'
import RefreshToken from '../models/refreshToken.model.js'

const signin = async (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate('roles', '-__v')
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err })
        return
      }

      if (!user) {
        return res.status(404).send({ message: 'User Not found.' })
      }

      if (!user.authenticate(req.body.password)) {
        return res
          .status('401')
          .send({ error: "Email and password don't match." })
      }
      const token = jwt.sign({ id: user.id }, config.jwtSecret, {
        expiresIn: config.jwtExpiration // 24 hours
      })

      const refreshToken = await RefreshToken.createToken(user)

      const authorities = []

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push(user.roles[i].name.toUpperCase())
      }
      res
        .status(200)
        .send({ user, accessToken: token, refreshToken })
    })
}

const refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body
  if (requestToken == null) {
    return res.status(403).json({ message: 'Refresh Token is required!' })
  }

  try {
    const refreshToken = await RefreshToken.findOne({ token: requestToken })

    if (!refreshToken) {
      res.status(403).json({ message: 'Refresh token is not in database!' })
      return
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false
      }).exec()

      res.status(403).json({
        message: 'Refresh token was expired. Please make a new signin request'
      })
      return
    }

    const newAccessToken = jwt.sign(
      { foo: refreshToken.user._id },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiration
      }
    )
    console.log(
      '🚀 ~ file: auth.controller.js:73 ~ refreshToken ~ newAccessToken:',
      newAccessToken
    )

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token
    })
  } catch (err) {
    return res.status(500).send({ message: err })
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

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization,
  refreshToken
}
