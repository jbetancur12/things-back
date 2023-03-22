import express from 'express'

// import authController from '../controllers/auth.controller.js'
import customerController from '../controllers/customer.controller.js'
// import authJwt from '../middlewares/authJwt.js'

const router = express.Router()

router
  .route('/api/customers')
  .get(customerController.list)
  .post(customerController.create)

// router.route('/api/customers/user/:userId').get(customerController.findByUserId)

router
  .route('/api/customers/:customerId')
  .get(customerController.find)
  .put(customerController.update)
  .delete(customerController.remove)

router.param('customerId', customerController.customerByID)
export default router
