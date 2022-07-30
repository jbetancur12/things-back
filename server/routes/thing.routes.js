import express from 'express'
// import authController from '../controllers/auth.controller.js'
import thingController from '../controllers/thing.controller.js'

const router = express.Router()

router
  .route('/api/things')
  .get(thingController.list)
  .post(thingController.create)

export default router
