import 'dotenv/config'

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5050,
  jwtSecret: process.env.JWT_SECRET || 'YOUR_secret_key',
  jwtExpiration: 3600, // 1 hour
  jwtRefreshExpiration: 86400, // 24 hours
  sendridPass: process.env.SENGRID_API_KEY,
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' +
      (process.env.IP || 'localhost') +
      ':' +
      (process.env.MONGO_PORT || '27017') +
      '/mqtt',
  emailFrom: 'proyectos@smaf.com.co',
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
