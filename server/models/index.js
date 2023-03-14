import mongoose from 'mongoose'
import user from './user.model.js'
import role from './roles.model.js'
import thing from './thing.model.js'
import refreshToken from './refreshToken.model.js'
import measurement from './measurement.model.js'
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.user = user
db.role = role
db.thing = thing
db.measurement = measurement
db.refreshToken = refreshToken

db.ROLES = ['USER_ROLE', 'ADMIN_ROLE', 'MODERATOR_ROLE']

export default db
