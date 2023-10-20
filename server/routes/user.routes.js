import express from 'express'
import authCtrl from '../controllers/auth.controller.js'
import userCtrl from '../controllers/user.controller.js'
import { authJwt, verifySignUp } from '../middlewares/index.js'

const router = express.Router()

router
  .route('/api/users')
  // .get(authJwt.verifyToken, authJwt.isAdmin, userCtrl.list)
  .get(userCtrl.list)
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
  //   .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)
  .delete(authJwt.verifyToken, authJwt.isAdmin, userCtrl.remove)

router.param('userId', userCtrl.userByID)

export default router
