import express from 'express'

import logsActuatorController from '../controllers/logsActuator.controller.js'

const router = express.Router()

router.route('/api/logs-actuactor').post(logsActuatorController.create)
router
  .route('/api/logs-actuactor/customer')
  .get(logsActuatorController.getAllByCustomer)

export default router
