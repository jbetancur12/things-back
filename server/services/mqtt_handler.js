import mqtt from 'mqtt'

import Controller from '../models/controller.model.js'
import db from '../models/index.js'
import { validarObjectId } from '../helpers/functions.js'

const Measure = db.measure
const Variable = db.variable
const Template = db.template

class MqttHandler {
  constructor () {
    this.mqttClient = null
    this.host = process.env.MQTT_HOST || 'mqtt://134.209.118.100:1883'
    this.username = process.env.MQTT_USER || 'jorge'
    this.password = process.env.MQTT_PASSWORD || 'jorge'
    this.averageData = {}
    this.timerId = null
    this.timerInterval = 0.5 * 60 * 1000 // 0.5 minutes (adjustable)
  }

  async connect () {
    try {
      this.mqttClient = mqtt.connect(this.host, {
        username: this.username,
        password: this.password,
        will: {
          topic: 'disconnected',
          payload: 'server',
          qos: 0,
          retain: true
        }
      })

      this.setupMqttListeners()
      this.startTimer()
    } catch (error) {
      console.error('Error connecting to MQTT:', error)
      this.disconnect()
    }
  }

  setupMqttListeners () {
    this.mqttClient.on('error', (err) => {
      console.error('MQTT error:', err)
      this.disconnect()
    })

    this.mqttClient.on('connect', () => {
      console.log('MQTT client connected')
    })

    this.mqttClient.on('message', this.handleMqttMessage.bind(this))

    this.mqttClient.on('close', () => {
      console.log('MQTT client disconnected')
    })
  }

  async handleMqttMessage (topic, message) {
    try {
      if (topic === 'disconnected' || topic === 'connected') {
        const controllerId = message.toString()
        await this.updateControllerConnectionStatus(
          controllerId,
          topic === 'connected'
        )
      }

      if (topic === 'sensor') {
        await this.processSensorData(message.toString())
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error)
    }
  }

  async updateControllerConnectionStatus (controllerId, connected) {
    const controllerFounded = await Controller.findOne({ controllerId })
    if (controllerFounded) {
      controllerFounded.connected = connected
      await controllerFounded.save()
    }
  }

  async processSensorData (dataString) {
    const plot = dataString.split('/')
    const templateId = validarObjectId(plot[1])
      ? plot[1]
      : await this.getTemplateId(plot[1])
    const variable = await Variable.findOne({ template: templateId })
      .where('virtualPin')
      .equals(plot[3])

    if (variable) {
      const value = parseFloat(plot[4])
      const key = `${plot[3]}-${templateId}`

      if (Object.prototype.hasOwnProperty.call(this.averageData, key)) {
        this.averageData[key].sum += value
        this.averageData[key].count++
        this.averageData[key].timestamp =
          plot[2] !== '0' ? new Date(parseInt(plot[2])) : new Date()
      } else {
        this.averageData[key] = {
          sum: value,
          count: 1,
          timestamp: plot[2] !== '0' ? new Date(parseInt(plot[2])) : new Date()
        }
      }
    }
  }

  async getTemplateId (templateKey) {
    const template = await Template.findOne({ templateKey })
    return template ? template._id.toString() : null
  }

  startTimer () {
    this.timerId = setInterval(async () => {
      await this.processAveragedData()
    }, this.timerInterval)
  }

  async processAveragedData () {
    for (const key in this.averageData) {
      if (Object.prototype.hasOwnProperty.call(this.averageData, key)) {
        const [virtualPin, template] = key.split('-')
        const { sum, count, timestamp } = this.averageData[key]
        const averageValue = sum / count

        const variable = await Variable.findOne({ template })
          .where('virtualPin')
          .equals(virtualPin)

        if (variable) {
          const templateId =
            template.length > 12 ? template : await this.getTemplateId(template)

          const averageMeasure = new Measure({
            customer: variable.customer,
            template: templateId,
            timestamp,
            virtualPin,
            value: averageValue,
            variable: variable._id
          })

          try {
            await averageMeasure.save()
          } catch (error) {
            console.error('Error saving average measure:', error)
          }

          this.resetAverageData(key)
        }
      }
    }
  }

  resetAverageData (key) {
    this.averageData[key].sum = 0
    this.averageData[key].count = 0
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

  publish (topic, message) {
    this.mqttClient.publish(topic, message)
  }

  subscribe (topic) {
    this.mqttClient.subscribe(topic, { qos: 0 })
  }

  disconnect () {
    if (this.mqttClient) {
      this.mqttClient.end()
    }

    if (this.timerId) {
      clearInterval(this.timerId)
    }
  }
}

export default MqttHandler
