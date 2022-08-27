import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import userRoutes from './server/routes/user.routes.js'
import authRoutes from './server/routes/auth.routes.js'
import sensorRoutes from './server/routes/sensor.routes.js'
import thingRoutes from './server/routes/thing.routes.js'

const app = express()
/* ... configure express ... */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet())

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to bezkoder application.' })
})
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', sensorRoutes)
app.use('/', thingRoutes)

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ': ' + err.message })
  } else if (err) {
    res.status(400).json({ error: err.name + ': ' + err.message })
    console.log(err)
  }
})

export default app
