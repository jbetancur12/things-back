import Thing from '../models/thing.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import { extend } from 'lodash'

const thingByID = async (req, res, next, id) => {
  try {
    const thing = await Thing.findById(id)

    if (!thing) {
      return res.status('400').json({
        error: 'Thing not found'
      })
    }
    req.thing = thing
    next()
  } catch (err) {
    return res.status('400').json({
      error: 'Could not retrieve thing'
    })
  }
}

const create = async (req, res) => {
  const thing = new Thing(req.body)
  try {
    await thing.save()
    return res.status(200).json({
      message: 'Successfully created!',
      data: thing
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {
  try {
    const things = await Thing.find({ ...req.query })
    res.json(things)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let thing = req.thing
    thing = extend(thing, req.body)
    thing.updated = Date.now()
    await thing.save()
    res.json(thing)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const findByUserId = async (req, res) => {
  try {
    const things = await Thing.find({ user: req.params.userId })
    res.json(things)
  } catch (error) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(error)
    })
  }
}

const remove = async (req, res) => {
  try {
    const thing = req.thing
    const deletedThing = await thing.remove()
    res.json(deletedThing)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { thingByID, create, list, remove, update, findByUserId }
