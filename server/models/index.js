import mongoose from 'mongoose'
import controller from './controller.model.js'
import controllerType from './controllerType.model.js'
import customer from './customer.model.js'
import measure from './measure.model.js'
import measurement from './measurement.model.js'
import refreshToken from './refreshToken.model.js'
import role from './roles.model.js'
import template from './template.model.js'
import thing from './thing.model.js'
import user from './user.model.js'
import variable from './variable.model.js'
import logsActuactor from './logsActuactor.model.js'
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
db.controller = controller
db.controllerType = controllerType
db.logsActuator = logsActuactor

db.ROLES = ['USER_ROLE', 'ADMIN_ROLE', 'MODERATOR_ROLE']

export default db
