import express from 'express'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'
import { verifySignUp, authJwt } from '../middlewares/index.js'

const router = express.Router()

router
  .route('/api/users')
  .get(authJwt.verifyToken, authJwt.isAdmin, userCtrl.list)
  .post(
    authJwt.test,
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    userCtrl.create
  )
router.route('/api/test/user').get(authJwt.verifyToken, userCtrl.userBoard)
router
  .route('/api/users/:userId')
  // .get(authCtrl.requireSignin, userCtrl.read)
  .get(userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)

router.param('userId', userCtrl.userByID)

export default router
