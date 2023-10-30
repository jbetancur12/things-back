import express from 'express'
import controllerTypeController from '../controllers/controllerType.controller.js'

const router = express.Router()

router
  .route('/api/controllerType')
  .get(controllerTypeController.list)
  .post(controllerTypeController.create)

export default router
