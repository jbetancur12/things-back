import 'dotenv/config'

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'YOUR_secret_key',
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' +
      (process.env.IP || '192.168.0.6') +
      ':' +
      (process.env.MONGO_PORT || '27017') +
      '/mernprojectv1'
}

export default config
