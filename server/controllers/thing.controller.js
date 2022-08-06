import Thing from '../models/thing.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import extend from 'lodash/extend.js'

const thingByID = async (req, res, next, id) => {
  try {
    const thing = await Thing.findById(id)
    console.log(thing)
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
  console.log(thing)
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
    const things = await Thing.find()
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
    console.log(thing)
    thing.updated = Date.now()
    await thing.save()
    res.json(thing)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
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

export default { thingByID, create, list, remove, update }
