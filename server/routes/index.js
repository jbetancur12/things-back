import express from 'express'

import authRoutes from './auth.routes.js'
import { router as controllerRoutes } from './controller.routes.js'
import controllerTypeRoutes from './controllerType.routes.js'
import customerRoutes from './customer.routes.js'
import uploadRoutes from './excel.routes.js'
import measureRoutes from './measure.routes.js'
import roleRoutes from './role.routes.js'
import sensorRoutes from './sensor.routes.js'
import suscriptionRoutes from './suscription.routes.js'
import templateRoutes from './template.routes.js'
import thingRoutes from './thing.routes.js'
import userRoutes from './user.routes.js'
import variableRoutes from './variable.routes.js'
import logsActuatorRoutes from './logsActuactor.routes.js'
const router = express.Router()

const routersList = [
  {
    path: '/',
    route: authRoutes
  },
  {
    path: '/',
    route: customerRoutes
  },
  {
    path: '/',
    route: uploadRoutes
  },
  {
    path: '/',
    route: measureRoutes
  },
  {
    path: '/',
    route: roleRoutes
  },
  {
    path: '/',
    route: sensorRoutes
  },
  {
    path: '/',
    route: suscriptionRoutes
  },
  {
    path: '/',
    route: templateRoutes
  },

  {
    path: '/',
    route: thingRoutes
  },
  {
    path: '/',
    route: userRoutes
  },
  {
    path: '/',
    route: variableRoutes
  },
  {
    path: '/',
    route: controllerRoutes
  },
  {
    path: '/',
    route: controllerTypeRoutes
  },
  {
    path: '/',
    route: logsActuatorRoutes
  }
]

routersList.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
