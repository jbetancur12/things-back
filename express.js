import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'

import Controller from './server/models/controller.model.js'
import authRoutes from './server/routes/auth.routes.js'
import { router as controllerRoutes } from './server/routes/controller.routes.js'
import customerRoutes from './server/routes/customer.routes.js'
import uploadRoutes from './server/routes/excel.routes.js'
import measureRoutes from './server/routes/measure.routes.js'
import roleRoutes from './server/routes/role.routes.js'
import sensorRoutes from './server/routes/sensor.routes.js'
import suscriptionRoutes from './server/routes/suscription.routes.js'
import templateRoutes from './server/routes/template.routes.js'
import thingRoutes from './server/routes/thing.routes.js'
import userRoutes from './server/routes/user.routes.js'
import variableRoutes from './server/routes/variable.routes.js'

// import nodemailer from 'nodemailer';
// (async function () {
//   const credentials = await nodemailer.createTestAccount();
//   console.log(credentials);
// })();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MAX_PING_INTERVAL = 60000

const app = express()
/* ... configure express ... */

app.set('view engine', 'pug')
app.set('views', `${__dirname}/views`)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet())

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smaf Cloud Api.' })
})

app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', sensorRoutes)
app.use('/', thingRoutes)
app.use('/', customerRoutes)
app.use('/', variableRoutes)
app.use('/', templateRoutes)
app.use('/', measureRoutes)
app.use('/', uploadRoutes)
app.use('/', roleRoutes)
app.use('/', suscriptionRoutes)
app.use('/', controllerRoutes)

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ': ' + err.message })
  } else if (err) {
    res.status(400).json({ error: err.name + ': ' + err.message })
    console.log(err)
  }
})

setInterval(async () => {
  try {
    // Consulta la base de datos para obtener la información más reciente de los controladores.
    const controllers = await Controller.find()

    controllers.forEach(async (controller) => {
      const currentTime = Date.now()

      if (
        controller.lastPingTime &&
        currentTime - controller.lastPingTime >= MAX_PING_INTERVAL &&
        controller.connected
      ) {
        // El controlador ha superado el tiempo máximo sin ping, lo consideramos desconectado.

        // Actualiza la información en la base de datos para marcar el controlador como desconectado.
        await Controller.findByIdAndUpdate(controller._id, { connected: false })
        console.log(
          `Controlador ${controller.controllerId} marcado como desconectado.`
        )
      }
    })
  } catch (error) {
    console.error('Error al consultar la base de datos:', error)
  }
}, 30000)

export default app
