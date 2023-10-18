import express from 'express'
import roleCtrl from '../controllers/role.controller.js'

const router = express.Router()

router.route('/api/roles').get(roleCtrl.list)

export default router
