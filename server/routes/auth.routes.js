import express from 'express'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/auth/signin').post(authCtrl.signin)
router.route('/api/auth/signout').get(authCtrl.signout)
router.route('/api/auth/refreshtoken').post(authCtrl.refreshToken)

export default router
