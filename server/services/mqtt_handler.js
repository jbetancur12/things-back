import mqtt from 'mqtt'
import Measurement from '../models/measurement.model.js'

class MqttHandler {
  constructor () {
    this.mqttClient = null
    this.host = 'mqtt://192.168.0.6:1883'
    this.username = '' // mqtt credentials if these are needed to connect
    this.password = ''
  }

  connect () {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host, {
      username: this.username,
      password: this.password
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
    this.mqttClient.on('message', async function (topic, message) {
      if (topic === 'json') {
        const topicParsed = JSON.parse(message.toString())
        const values = {
          temperature: topicParsed.temperature,
          humidity: topicParsed.humidity
        }
        const measure = new Measurement(values)
        try {
          await measure.save()
        } catch (err) {
          console.log('Error;', err)
        }
        // const values = [topicParsed.temperature, topicParsed.humidity]
        // pool.connect((err, client, done) => {
        //   const query = `INSERT INTO public.sensors(temperature, humidity) VALUES ($1,$2);`;
        //   client.query(query, values, (error, result) => {
        //     done();
        //     if (error) {
        //       console.log(error);
        //     }
        //   })
        // })
      }
    })

    this.mqttClient.on('close', () => {
      console.log('mqtt client disconnected')
    })
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage (message) {
    console.log(message)
    this.mqttClient.publish('topic_on_off_led', message)
  }

  subscribe (topic) {
    console.log(topic)
    this.mqttClient.subscribe(topic, { qos: 0 })
  }

  // subscribers(topics: string[]) {
  //   this.mqttClient.subscribe(topics, { qos: 0 });
  // //  topics.forEach(topic => this.subscribe(topic))
  // }
}

export default MqttHandler
