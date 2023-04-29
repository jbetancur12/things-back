import config from './config/config.js'
import app from './express.js'
import MqttHandler from './server/services/mqtt_handler.js'
import db from './server/models/index.js'

const Role = db.role

const mqttClient = new MqttHandler()
mqttClient.connect()

db.mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// .then(() => {
//   () => {
//       console.log("🚀 Successfully connect to MongoDB.");
//   },
//   err => {
//       console.error("Connection error", err);
//       process.exit();
//   }
//   initial();
// })

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

app.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
  mqttClient.subscribe(['jsonv2', 'json'])
})
