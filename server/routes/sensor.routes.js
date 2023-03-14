import express from 'express'
// import authController from '../controllers/auth.controller.js'
import sensorController from '../controllers/sensor.controller.js'

const router = express.Router()

router.route('/api/sensor/data').get(sensorController.getByPeriod)

router.route('/api/sensor/maxmin').get(sensorController.getMaxMin)

router.route('/api/sensor/excel').get(sensorController.excel)

export default router
