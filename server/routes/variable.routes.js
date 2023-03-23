import express from 'express'

// import authController from '../controllers/auth.controller.js'
import variableController from '../controllers/variable.controller.js'
// import authJwt from '../middlewares/authJwt.js'

const router = express.Router()

router
  .route('/api/variables')
  .get(variableController.list)
  .post(variableController.create)

// router.route('/api/variable/user/:userId').get(variableController.findByUserId)

router
  .route('/api/variables/:variableId')
  .get(variableController.find)
  .put(variableController.update)
  .delete(variableController.remove)

router.param('variableId', variableController.variableByID)
export default router
