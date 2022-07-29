import config from './config/config.js'
import app from './express.js'
import mongoose from 'mongoose'
import MqttHandler from './server/services/mqtt_handler.js'

const mqttClient = new MqttHandler()
mqttClient.connect()

mongoose.Promise = global.Promise
mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to the database!')
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err)
    process.exit()
  })

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`)
})

app.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
  mqttClient.subscribe([
    'topic_sensor_temperature',
    'topic_sensor_humidity',
    'json'
  ])
})
