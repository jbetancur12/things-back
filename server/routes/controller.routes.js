import express from 'express'
import connCtrl from '../controllers/controller.controller.js'

const router = express.Router()

// Estructura para rastrear el estado de conexión de los controladores y el tiempo del último ping.
const controllerStatus = {}
const lastPingTime = {}

// Define el tiempo máximo (en milisegundos) sin recibir un ping antes de considerar un controlador desconectado.

router
  .route('/api/check-controller-status/:controllerId')
  .post(connCtrl.checkConnection)
router.route('/api/controller').post(connCtrl.crearControlador)

router.route('/api/controller/:controllerId').delete(connCtrl.remove)

router.param('controllerId', connCtrl.controllerByID)
// Exporta el router, lastPingTime y controllerStatus para que estén disponibles en otros archivos.
export { controllerStatus, lastPingTime, router }
