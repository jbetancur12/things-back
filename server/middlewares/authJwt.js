import jwt from 'jsonwebtoken'
import config from '../../config/config.js'
import db from '../models/index.js'
const User = db.user
const Role = db.role

const { TokenExpiredError } = jwt

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: 'Unauthorized! Access Token was expired!' })
  }

  return res.sendStatus(401).send({ message: 'Unauthorized!' })
}

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' })
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return catchError(err, res)
    }
    req.userId = decoded.id
    next()
  })
}

const test = (req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept'
  )
  next()
}

const isAdmin = (req, res, next) => {
  try {
    User.findById(req.userId).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err })
        return
      }

      console.log('=>', user)
      if (user.roles) {
        Role.find(
          {
            _id: { $in: user.roles }
          },
          (err, roles) => {
            if (err) {
              res.status(500).send({ message: err })
              return
            }

            for (let i = 0; i < roles.length; i++) {
              if (roles[i].name === 'ADMIN_ROLE') {
                next()
                return
              }
            }

            res.status(403).send({ message: 'Require Admin Role!' })
          }
        )
      }
    })
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

const isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err })
      return
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err })
          return
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === 'MODERATOR_ROLE') {
            next()
            return
          }
        }

        res.status(403).send({ message: 'Require Moderator Role!' })
      }
    )
  })
}

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  test
}
export default authJwt
