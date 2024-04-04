import express from 'express'

import logsActuatorController from '../controllers/logsActuator.controller.js'

const router = express.Router()

router.route('/api/logs-actuator').post(logsActuatorController.create)
router
  .route('/api/logs-actuator/customer/:id')
  .get(logsActuatorController.getAllByCustomer)

export default router
