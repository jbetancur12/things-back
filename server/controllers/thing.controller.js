import Thing from '../models/thing.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const create = async (req, res) => {
  const thing = new Thing(req.body)
  console.log(thing)
  try {
    await thing.save()
    return res.status(200).json({
      message: 'Successfully signed up!'
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {
  try {
    const things = await Thing.find().select()
    res.json(things)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default { create, list }
