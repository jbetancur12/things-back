import mqtt from 'mqtt'
import Controller from '../models/controller.model.js'
import db from '../models/index.js'

const Measure = db.measure
const Variable = db.variable
class MqttHandler {
  constructor () {
    this.mqttClient = null
    this.host = process.env.MQTT_HOST || 'mqtt://134.209.118.100:1883'
    this.username = process.env.MQTT_USER || 'jorge' // mqtt credentials if these are needed to connect
    this.password = process.env.MQTT_PASSWORD || 'jorge'
    this.averageData = {}
    this.timerId = null
  }

  connect () {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host, {
      username: this.username,
      password: this.password,
      will: {
        topic: 'disconnected', // Tema del mensaje LWT
        payload: 'server', // Contenido del mensaje LWT
        qos: 0, // Nivel de calidad de servicio
        retain: true // Retención del mensaje LWT
      }
    })

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err)
      this.mqttClient.end()
    })

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log('mqtt client connected')
    })

    // mqtt subscriptions
    // this.mqttClient.subscribe('topic_on_off_led', { qos: 0 });
    // this.mqttClient.subscribe('topic_sensor_temperature', { qos: 0 });
    // this.mqttClient.subscribe('topic_sensor_humidity', { qos: 0 });

    // When a message arrives, console.log it
    this.mqttClient.on('message', async (topic, message) => {
      try {
        if (topic === 'disconnected') {
          const controller = message.toString()
          const controllerFounded = await Controller.findOne({
            controllerId: controller
          })
          if (controllerFounded) {
            controllerFounded.connected = false
            await controllerFounded.save()
          }
        }

        if (topic === 'connected') {
          const controller = message.toString()
          const controllerFounded = await Controller.findOne({
            controllerId: controller
          })
          if (controllerFounded) {
            controllerFounded.connected = true
            await controllerFounded.save()
          }
        }

        if (topic === 'sensor') {
          const plot = message.toString().split('/')

          const variable = await Variable.findOne({ template: plot[1] })
            .where('virtualPin')
            .equals(plot[3])

          if (!variable) return

          const value = parseFloat(plot[4])

          // Generate a unique key for the combination of plot[3] and plot[1]
          const key = `${plot[3]}-${plot[1]}`

          // Check if an entry already exists for the combination
          if (Object.prototype.hasOwnProperty.call(this.averageData, key)) {
            // If the entry already exists, add the value to the accumulator and increase the corresponding count
            this.averageData[key].sum += value
            this.averageData[key].count++
            this.averageData[key].timestamp =
              plot[2] !== '0' ? new Date(parseInt(plot[2])) : new Date()
          } else {
            // If the entry does not exist, create a new entry in averageData with the accumulator and count initialized to the current values
            this.averageData[key] = {
              sum: value,
              count: 1,
              timestamp:
                plot[2] !== '0' ? new Date(parseInt(plot[2])) : new Date()
            }
          }
        }
      } catch (error) {
        console.error('Error occurred:', error)
      }
    })

    this.mqttClient.on('close', () => {
      console.log('mqtt client disconnected')
    })

    this.startTimer()
  }

  startTimer () {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }

    this.timerId = setInterval(async () => {
      for (const key in this.averageData) {
        if (Object.prototype.hasOwnProperty.call(this.averageData, key)) {
          const [virtualPin, template] = key.split('-')
          const { sum, count, timestamp } = this.averageData[key]
          const averageValue = sum / count

          const variable = await Variable.findOne({ template })
            .where('virtualPin')
            .equals(virtualPin)

          if (!variable) continue

          // Create a new measurement document for the average

          const averageMeasure = new Measure({
            customer: variable.customer,
            template,
            timestamp,
            virtualPin,
            value: averageValue,
            variable: variable._id
          })

          try {
            await averageMeasure.save()
          } catch (error) {
            console.log(error)
          }

          // Reset the accumulator and count for the current combination
          this.averageData[key].sum = 0
          this.averageData[key].count = 0
        }
      }
    }, 2 * 60 * 1000)
  }

  onMessage (callback) {
    this.mqttClient.on('message', async (topic, message) => {
      try {
        callback(topic, message)
      } catch (error) {
        console.error('Error occurred:', error)
      }
    })
  }

  // Sends a mqtt message to topic: mytopic
  publish (topic, message) {
    this.mqttClient.publish(topic, message)
  }

  subscribe (topic) {
    console.log(topic)
    this.mqttClient.subscribe(topic, { qos: 0 })
  }
}

export default MqttHandler
