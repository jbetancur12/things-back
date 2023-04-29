import 'dotenv/config'

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5050,
  jwtSecret: process.env.JWT_SECRET || 'YOUR_secret_key',
  jwtExpiration: 3600, // 1 hour
  jwtRefreshExpiration: 86400, // 24 hours
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' +
      (process.env.IP || '192.168.0.6') +
      ':' +
      (process.env.MONGO_PORT || '27017') +
      '/mqtt',
  emailFrom: 'jabetancur12@gmail.com',
  smtp: {
    service: 'gmail',
    secure: false,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER
  }
}

export default config
