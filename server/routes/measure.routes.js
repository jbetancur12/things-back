import express from 'express'

// import authController from '../controllers/auth.controller.js'
import measureController from '../controllers/measure.controller.js'
// import authJwt from '../middlewares/authJwt.js'

const router = express.Router()

router
  .route('/api/measures')
  .get(measureController.list)
  .post(measureController.create)

// router.route('/api/measure/user/:userId').get(measureController.findByUserId)

router.route('/api/measures/data').get(measureController.getByPeriod)

router
  .route('/api/measures/:measureId')
  .get(measureController.find)
  .put(measureController.update)
  .delete(measureController.remove)

router.param('measureId', measureController.measureByID)
export default router
