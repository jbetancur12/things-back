import express from 'express'
import sensorController from '../controllers/sensor.controller.js'

const router = express.Router()

router.route('/api/sensor').get(sensorController.getByPeriod)

export default router
