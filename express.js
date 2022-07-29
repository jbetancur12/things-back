import express from 'express'
import cors from 'cors'

import userRoutes from './server/routes/user.routes.js'
import authRoutes from './server/routes/auth.routes.js'
import MqttHandler from './server/services/mqtt_handler.js'

const app = express()
/* ... configure express ... */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const mqttClient = new MqttHandler()
mqttClient.connect()

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to bezkoder application.' })
})
app.use('/', userRoutes)
app.use('/', authRoutes)

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ': ' + err.message })
  } else if (err) {
    res.status(400).json({ error: err.name + ': ' + err.message })
    console.log(err)
  }
})

export default app
