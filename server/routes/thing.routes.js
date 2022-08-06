import express from 'express'
// import authController from '../controllers/auth.controller.js'
import thingController from '../controllers/thing.controller.js'

const router = express.Router()

router
  .route('/api/things')
  .get(thingController.list)
  .post(thingController.create)

router
  .route('/api/things/:thingId')
  .put(thingController.update)
  .delete(thingController.remove)

router.param('thingId', thingController.thingByID)
export default router
