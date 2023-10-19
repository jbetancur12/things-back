import express from 'express'
import suscriptionController from '../controllers/suscription.controller.js'

const router = express.Router()

router
  .route('/api/activate-subscription/:customerId')
  .post(suscriptionController.activate)

router
  .route('/api/activate-trial/:customerId')
  .post(suscriptionController.trial)

router
  .route('/api/check-suscriptions/:customerId')
  .post(suscriptionController.checkSuscriptions)

export default router
