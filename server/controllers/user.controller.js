import db from '../models/index.js'

import extend from 'lodash/extend.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const User = db.user
const Role = db.role

const create = (req, res) => {
  const user = new User(req.body)
  user.save((err, user) => {
    if (err) {
      res.status(500).json({ message: err })
      return
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).json({ message: err })
            return
          }

          user.roles = roles.map((role) => role._id)
          user.save((err) => {
            if (err) {
              res.status(500).json({ message: err })
              return
            }

            res
              .status(200)
              .json({ message: 'User was registered successfully!' })
          })
        }
      )
    } else {
      Role.findOne({ name: 'USER_ROLE' }, (err, role) => {
        if (err) {
          res.status(500).json({ message: err })
          return
        }
        user.roles = [role._id]
        user.save((err) => {
          if (err) {
            res.status(500).json({ message: err })
            return
          }
          res.status(200).json({ message: 'User was registered successfully!' })
        })
      })
    }
  })
}

const list = async (req, res) => {
  try {
    if (!req.query.email) {
      const users = await User.find({ ...req.query })
      res.json(users)
    } else {
      const email = req.query.email
      const users = await User.find({
        email: new RegExp(email, 'i')
      }).exec()
      res.json(users)
    }
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const userByID = async (req, res, next, id) => {
  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status('400').json({
        error: 'User not found'
      })
    }
    req.profile = user
    next()
  } catch (err) {
    return res.status('400').json({
      error: 'Could not retrieve user'
    })
  }
}

const userByName = async (req, res) => {
  try {
    const email = req.params.email

    const users = await User.find({
      'email.name': new RegExp(email, 'i')
    }).exec()
    res.json(users)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const update = async (req, res) => {
  try {
    let user = req.profile
    user = extend(user, req.body)
    user.updated = Date.now()
    await user.save()
    user.hashed_password = undefined
    user.salt = undefined
    res.json(user)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    const user = req.profile
    const deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const userBoard = (req, res) => {
  res.status(200).json('User Content.')
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  userBoard,
  userByName
}
