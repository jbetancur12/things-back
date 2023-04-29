import mongoose from 'mongoose'
import user from './user.model.js'
import role from './roles.model.js'
import thing from './thing.model.js'
import refreshToken from './refreshToken.model.js'
import measurement from './measurement.model.js'
import customer from './customer.model.js'
import variable from './variable.model.js'
import template from './template.model.js'
import measure from './measure.model.js'
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.user = user
db.role = role
db.thing = thing
db.measurement = measurement
db.refreshToken = refreshToken
db.customer = customer
db.variable = variable
db.template = template
db.measure = measure

db.ROLES = ['USER_ROLE', 'ADMIN_ROLE', 'MODERATOR_ROLE']

export default db
