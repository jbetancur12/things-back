import express from 'express'

// import authController from '../controllers/auth.controller.js'
import templateController from '../controllers/template.controller.js'
// import authJwt from '../middlewares/authJwt.js'

const router = express.Router()

router
  .route('/api/templates')
  .get(templateController.list)
  .post(templateController.create)

// router.route('/api/template/user/:userId').get(templateController.findByUserId)

router
  .route('/api/templates/:templateId')
  .get(templateController.find)
  .put(templateController.update)
  .delete(templateController.remove)

router.param('templateId', templateController.templateByID)
export default router
