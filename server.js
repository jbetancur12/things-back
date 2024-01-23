import http from 'http'

import { WebSocket, WebSocketServer } from 'ws'
import config from './config/config.js'
import app from './express.js'
import db from './server/models/index.js'
import './server/services/cron.js'
// import './server/services/sendReports.js'
import MqttHandler from './server/services/mqtt_handler.js'

const Role = db.role

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

const mqttClient = new MqttHandler()
mqttClient.connect()

const clients = new Set()

wss.on('connection', (ws) => {
  // Agregar el cliente WebSocket a la lista de clientes conectados

  clients.add(ws)
  // Eliminar el cliente WebSocket de la lista cuando se cierra la conexión
  ws.on('close', () => {
    clients.delete(ws)
  })

  // Manejar mensajes del cliente WebSocket si es necesario
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)

      // Procesar el mensaje según su tipo (publish o subscribe)
      if (data.type === 'publish') {
        mqttClient.publish(data.topic, data.message)
      } else if (data.type === 'subscribe') {
        mqttClient.subscribe(data.topic)
      }
    } catch (error) {
      console.error('Error al procesar el mensaje:', error)
    }
  })
})

db.mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('🚀 Successfully connect to MongoDB.')
  })
  .catch((err) => {
    console.error('Connection error', err)
    process.exit()
  })

db.mongoose.connection.on('connected', () => initial())

function initial () {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: 'USER_ROLE'
      }).save((err) => {
        if (err) {
          console.log('error', err)
        }

        console.log("added 'user' to roles collection")
      })

      new Role({
        name: 'MODERATOR_ROLE'
      }).save((err) => {
        if (err) {
          console.log('error', err)
        }

        console.log("added 'moderator' to roles collection")
      })

      new Role({
        name: 'ADMIN_ROLE'
      }).save((err) => {
        if (err) {
          console.log('error', err)
        }

        console.log("added 'admin' to roles collection")
      })
    }
  })
}

mqttClient.onMessage((topic, message) => {
  const messageStr = message.toString()

  const payload = {
    topic,
    message: messageStr
  }

  clients.forEach((client) => {
    // Verificar si el cliente WebSocket está abierto antes de enviar el mensaje
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload))
    }
  })
})

server.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
  mqttClient.subscribe([
    'sensor',
    'output',
    'connected',
    'disconnected',
    'input'
  ])
})
