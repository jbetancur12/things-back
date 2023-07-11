import express from 'express'
import multer from 'multer'

import excelController from '../controllers/excel.controller.js'

const router = express.Router()

// Configuración del almacenamiento de archivos con Multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

// Función de middleware para la carga de archivos con Multer
const uploadMiddleware = multer({ storage }).single('file')

// Ruta POST para la carga de archivos
router.post('/api/upload', uploadMiddleware, excelController.upload)

export default router
