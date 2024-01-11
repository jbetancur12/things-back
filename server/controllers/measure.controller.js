import extend from 'lodash/extend.js'
import mongoose from 'mongoose'
import errorHandler from '../helpers/dbErrorHandler.js'
import ExcelJS from 'exceljs'

const Measure = mongoose.model('Measure')

const getByPeriod = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate)
    const endDate = new Date(req.query.endDate)
    const variables = req.query.variables
      .split(',')
      .map((variable) => mongoose.Types.ObjectId(variable))

    const timeDiff = endDate - startDate // Diferencia de tiempo en milisegundos

    const unitConfigurations = [
      //   { timeLimit: 1 * 60 * 60 * 1000, unit: 'minute', binSize: 2 }, // Una hora
      { timeLimit: 6 * 60 * 60 * 1000, unit: 'minute', binSize: 2 }, // 6 Horas
      { timeLimit: 1 * 24 * 60 * 60 * 1000, unit: 'minute', binSize: 5 }, // 1 dias
      //   { timeLimit: 3 * 24 * 60 * 60 * 1000, unit: 'hour', binSize: 1 },
      { timeLimit: 1 * 7 * 24 * 60 * 60 * 1000, unit: 'hour', binSize: 1 }, // 7 dias
      { timeLimit: 4 * 7 * 24 * 60 * 60 * 1000, unit: 'hour', binSize: 2 } // 1 mes
    ]

    // const { unit, binSize } = unitConfigurations.find(
    //   (config) => {
    //     return timeDiff <= config.timeLimit}
    // )

    const result = unitConfigurations.find((config) => {
      return timeDiff <= config.timeLimit
    })

    let unit = 'hour' // Valor predeterminado por defecto
    let binSize = 2 // Valor predeterminado por defecto

    if (result && result.timeLimit <= 4 * 7 * 24 * 60 * 60 * 1000) {
      // Si se encuentra una configuración válida con límite de tiempo de un mes o más,
      // entonces usa esa configuración
      unit = result.unit // Asignación destructiva
      binSize = result.binSize
    }

    const pipeline = [
      {
        $lookup: {
          from: 'variables',
          localField: 'variable',
          foreignField: '_id',
          as: 'variable'
        }
      },
      {
        $match: {
          $and: [
            { createdAt: { $gte: startDate, $lte: endDate } },
            { template: mongoose.Types.ObjectId(req.query.template) },
            { 'variable._id': { $in: variables } }
          ]
        }
      },
      {
        $addFields: {
          roundedTimestamp: {
            $dateTrunc: {
              date: '$createdAt',
              unit,
              binSize
            }
          },
          // numericValue: {
          //   $round: [{ $toDouble: '$value' }, 2]
          // },
          numericValue: {
            $cond: {
              if: { $eq: ['$value', 'NaN'] }, // Agrega esta línea para manejar "NaN"
              then: null, // O cualquier otro valor que desees asignar para "NaN"
              else: { $round: [{ $toDouble: '$value' }, 2] }
            }
          },
          variableName: '$variable.name',
          variableUnit: '$variable.unit'
        }
      },
      {
        $match: {
          numericValue: { $ne: null } // Filtrar documentos donde "numericValue" no sea null (es decir, no sea "NaN")
        }
      },
      {
        $group: {
          _id: {
            variableName: '$variableName',
            variableUnit: '$variableUnit',
            roundedTimestamp: '$roundedTimestamp'
          },
          avgValue: {
            $avg: '$numericValue'
          }
        }
      },
      {
        $group: {
          _id: '$_id.roundedTimestamp',
          units: {
            $push: {
              k: { $arrayElemAt: ['$_id.variableName', 0] },
              v: { $arrayElemAt: ['$_id.variableUnit', 0] }
            }
          },
          measurements: {
            $push: {
              k: { $arrayElemAt: ['$_id.variableName', 0] },
              v: '$avgValue'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          timestamp: '$_id',
          units: {
            $arrayToObject: '$units'
          },
          measurements: {
            $arrayToObject: '$measurements'
          }
        }
      },
      {
        $sort: {
          timestamp: 1
        }
      }
    ]

    // $convert: { input: '$value', to: 'double', onError: 0 }

    const m = await Measure.aggregate(pipeline)

    res.json(m)
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

// const getByPeriod = async (req, res) => {
//     try {
//         const startTime = performance.now()
//         const interval = 24 * 60 * 60 * 1000;
//         const startDate = new Date(req.query.startDate);
//         const endDate = new Date(req.query.endDate);
//         const timeDiff = endDate - startDate;

//         let unit, binSize;

//         if (timeDiff <= 1 * 60 * 60 * 1000) {
//             unit = 'minute';
//             binSize = 10;
//         } else if (timeDiff <= 6 * 60 * 60 * 1000) {
//             unit = 'minute';
//             binSize = 30;
//         } else if (timeDiff <= 24 * 60 * 60 * 1000) {
//             unit = 'minute';
//             binSize = 60;
//         } else if (timeDiff <= 7 * 24 * 60 * 60 * 1000) {
//             unit = 'day';
//             binSize = 1;
//         } else {
//             unit = 'day';
//             binSize = 7;
//         }

//         const results = [];

//         let lowerBound = startDate;
//         let upperBound = new Date(lowerBound.getTime() + interval);

//         while (lowerBound < endDate) {

//             const pipeline = [
//                 {
//                     $lookup: {
//                         from: 'variables',
//                         localField: 'variable',
//                         foreignField: '_id',
//                         as: 'variable'
//                     }
//                 },
//                 {
//                     $match: {
//                         $and: [
//                             {
//                                 createdAt: {
//                                     $gte: lowerBound,
//                                     $lte: upperBound
//                                 }
//                             },
//                             { template: mongoose.Types.ObjectId(req.query.template) }
//                         ]
//                     }
//                 },
//                 {
//                     $addFields: {
//                         roundedTimestamp: {
//                             $dateTrunc: {
//                                 date: '$createdAt',
//                                 unit,
//                                 binSize
//                             }
//                         },
//                         numericValue: {
//                             $convert: { input: '$value', to: 'double', onError: 0 }
//                         },
//                         variableName: '$variable.name',
//                         variableUnit: '$variable.unit'
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             variableName: '$variableName',
//                             variableUnit: '$variableUnit',
//                             roundedTimestamp: '$roundedTimestamp'
//                         },
//                         avgValue: {
//                             $avg: '$numericValue'
//                         }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: '$_id.roundedTimestamp',
//                         units: {
//                             $push: {
//                                 k: { $arrayElemAt: ['$_id.variableName', 0] },
//                                 v: { $arrayElemAt: ['$_id.variableUnit', 0] }
//                             }
//                         },
//                         measurements: {
//                             $push: {
//                                 k: { $arrayElemAt: ['$_id.variableName', 0] },
//                                 v: '$avgValue'
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         timestamp: '$_id',
//                         units: {
//                             $arrayToObject: '$units'
//                         },
//                         measurements: {
//                             $arrayToObject: '$measurements'
//                         }
//                     }
//                 },
//                 {
//                     $sort: {
//                         timestamp: 1
//                     }
//                 }
//             ];

//             const queryResult = await Measure.aggregate(pipeline);
//             results.push(queryResult);

//             Actualizar los límites de fecha para el siguiente intervalo
//             lowerBound = upperBound;
//             upperBound = new Date(lowerBound.getTime() + interval);
//         }

//         const m = await Measure.aggregate(pipeline);

//         const combinedResults = [].concat(...results);
//         const endTime = performance.now() // Registra el tiempo de finalización
//         const duration = endTime - startTime // Calcula la duración en milisegundos
//         console.log("🚀 ~ file: measure.controller.js:251 ~ getByPeriod ~ duration:", duration)
//         res.json(combinedResults);

//         res.json(m);
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({
//             error: errorHandler.getErrorMessage(err)
//         });
//     }
// };

// const getByPeriod = async (req, res) => {
//     try {
//         const startTime = performance.now()
//         const interval = 24 * 60 * 60 * 1000;
//         const startDate = new Date(req.query.startDate);
//         const endDate = new Date(req.query.endDate);
//         const timeDiff = endDate - startDate;

//         let unit, binSize;

//         if (timeDiff <= 1 * 60 * 60 * 1000) {
//             unit = 'minute';
//             binSize = 10;
//         } else if (timeDiff <= 6 * 60 * 60 * 1000) {
//             unit = 'minute';
//             binSize = 30;
//         } else if (timeDiff <= 24 * 60 * 60 * 1000) {
//             unit = 'minute';
//             binSize = 60;
//         } else if (timeDiff <= 7 * 24 * 60 * 60 * 1000) {
//             unit = 'day';
//             binSize = 1;
//         } else {
//             unit = 'day';
//             binSize = 7;
//         }

//         const pipeline = [
//             {
//                 $lookup: {
//                     from: 'variables',
//                     localField: 'variable',
//                     foreignField: '_id',
//                     as: 'variable'
//                 }
//             },
//             {
//                 $match: {
//                     $and: [
//                         {
//                             createdAt: {
//                                 $gte: startDate,
//                                 $lte: endDate
//                             }
//                         },
//                         { template: mongoose.Types.ObjectId(req.query.template) }
//                     ]
//                 }
//             },
//             {
//                 $addFields: {
//                     roundedTimestamp: {
//                         $dateTrunc: {
//                             date: '$createdAt',
//                             unit,
//                             binSize
//                         }
//                     },
//                     numericValue: {
//                         $convert: { input: '$value', to: 'double', onError: 0 }
//                     },
//                     variableName: '$variable.name',
//                     variableUnit: '$variable.unit'
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         variableName: '$variableName',
//                         variableUnit: '$variableUnit',
//                         roundedTimestamp: '$roundedTimestamp'
//                     },
//                     avgValue: {
//                         $avg: '$numericValue'
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$_id.roundedTimestamp',
//                     units: {
//                         $push: {
//                             k: { $arrayElemAt: ['$_id.variableName', 0] },
//                             v: { $arrayElemAt: ['$_id.variableUnit', 0] }
//                         }
//                     },
//                     measurements: {
//                         $push: {
//                             k: { $arrayElemAt: ['$_id.variableName', 0] },
//                             v: '$avgValue'
//                         }
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     timestamp: '$_id',
//                     units: {
//                         $arrayToObject: '$units'
//                     },
//                     measurements: {
//                         $arrayToObject: '$measurements'
//                     }
//                 }
//             },
//             {
//                 $sort: {
//                     timestamp: 1
//                 }
//             }
//         ];

//         const queryResult = await Measure.aggregate(pipeline);

//         // Dividir los resultados en intervalos de tiempo
//         const results = [];
//         let lowerBound = startDate;
//         let upperBound = new Date(lowerBound.getTime() + interval);

//         while (lowerBound < endDate) {
//             const intervalResults = queryResult.filter(item => {
//                 return item.timestamp >= lowerBound && item.timestamp < upperBound;
//             });

//             results.push(intervalResults);

//             lowerBound = upperBound;
//             upperBound = new Date(lowerBound.getTime() + interval);
//         }

//         const combinedResults = [].concat(...results);
//         const endTime = performance.now() // Registra el tiempo de finalización
//         const duration = endTime - startTime // Calcula la duración en milisegundos
//         console.log("🚀 ~ file: measure.controller.js:394 ~ getByPeriod ~ duration:", duration)
//         res.json(combinedResults);
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({
//             error: errorHandler.getErrorMessage(err)
//         });
//     }
// }

// const getByPeriod = async (req, res) => {
//   try {
//     const startTime = performance.now() // Registra el tiempo de finalización
//     const interval = 24 * 60 * 60 * 1000
//     const startDate = new Date(req.query.startDate)
//     const endDate = new Date(req.query.endDate)
//     const timeDiff = endDate - startDate

//     let unit, binSize

//     if (timeDiff <= 1 * 60 * 60 * 1000) {
//       unit = 'minute'
//       binSize = 10
//     } else if (timeDiff <= 6 * 60 * 60 * 1000) {
//       unit = 'minute'
//       binSize = 30
//     } else if (timeDiff <= 24 * 60 * 60 * 1000) {
//       unit = 'minute'
//       binSize = 60
//     } else if (timeDiff <= 7 * 24 * 60 * 60 * 1000) {
//       unit = 'day'
//       binSize = 1
//     } else {
//       unit = 'day'
//       binSize = 7
//     }

//     const pipeline = [
//       {
//         $lookup: {
//           from: 'variables',
//           localField: 'variable',
//           foreignField: '_id',
//           as: 'variable'
//         }
//       },
//       {
//         $match: {
//           $and: [
//             {
//               createdAt: {
//                 $gte: startDate,
//                 $lte: endDate
//               }
//             },
//             { template: mongoose.Types.ObjectId(req.query.template) }
//           ]
//         }
//       },
//       {
//         $addFields: {
//           roundedTimestamp: {
//             $dateTrunc: {
//               date: '$createdAt',
//               unit,
//               binSize
//             }
//           },
//           numericValue: {
//             $convert: { input: '$value', to: 'double', onError: 0 }
//           },
//           variableName: '$variable.name',
//           variableUnit: '$variable.unit'
//         }
//       },
//       {
//         $group: {
//           _id: {
//             variableName: '$variableName',
//             variableUnit: '$variableUnit',
//             roundedTimestamp: '$roundedTimestamp'
//           },
//           avgValue: {
//             $avg: '$numericValue'
//           }
//         }
//       },
//       {
//         $group: {
//           _id: '$_id.roundedTimestamp',
//           units: {
//             $push: {
//               k: '$_id.variableName',
//               v: '$_id.variableUnit'
//             }
//           },
//           measurements: {
//             $push: {
//               k: '$_id.variableName',
//               v: '$avgValue'
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           timestamp: '$_id',
//           units: {
//             $arrayToObject: '$units'
//           },
//           measurements: {
//             $arrayToObject: '$measurements'
//           }
//         }
//       },
//       {
//         $sort: {
//           timestamp: 1
//         }
//       }
//     ]

//     const queryResult = await Measure.aggregate(pipeline)

//     const results = []

//     let lowerBound = startDate
//     let upperBound = new Date(lowerBound.getTime() + interval)

//     while (lowerBound < endDate) {
//       const intervalResults = queryResult.filter(
//         (item) =>
//           item.timestamp >= lowerBound.getTime() &&
//           item.timestamp < upperBound.getTime()
//       )

//       results.push(...intervalResults)

//       lowerBound = upperBound
//       upperBound = new Date(lowerBound.getTime() + interval)
//     }

//     const endTime = performance.now() // Registra el tiempo de finalización
//     const duration = endTime - startTime // Calcula la duración en milisegundos
//     console.log(
//       '🚀 ~ file: measure.controller.js:251 ~ getByPeriod ~ duration:',
//       duration
//     )

//     res.json(results)
//   } catch (err) {
//     console.log(err)
//     return res.status(400).json({
//       error: errorHandler.getErrorMessage(err)
//     })
//   }
// }

/**
 * Middleware to handle requests for a specific measure
 *
 *
 */

const getFirstAndLastDate = async (req, res) => {
  const customerId = req.params.customerId

  try {
    const firstData = await Measure.findOne({ customer: customerId }).sort({
      createdAt: 1
    })
    const lastData = await Measure.findOne({ customer: customerId }).sort({
      createdAt: -1
    })

    if (!firstData || !lastData) {
      return res.status(404).json({
        error: 'No data found for the specified customer ID'
      })
    }

    const result = {
      firstDate: firstData.createdAt,
      lastDate: lastData.createdAt
    }

    res.json(result)
  } catch (err) {
    console.error('Error al obtener fechas:', err)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
}

const rawData = async (req, res) => {
  const customerId = req.params.customerId
  const startDate = req.query.startDate // Obtener fecha de inicio desde los parámetros de consulta
  const endDate = req.query.endDate

  try {
    const query = { customer: customerId }

    // Agregar filtro de rango de tiempo si se proporcionan fechas
    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }
    const measures = await Measure.find(query)

    if (measures.length === 0) {
      return res.status(404).json({
        error: 'No measures found for the specified customer ID'
      })
    }

    // Crear un nuevo libro de Excel y hoja de cálculo
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Medidas')

    // Agregar encabezados
    worksheet.addRow(['value', 'createdAt']) // Ajusta los nombres de campo según tu modelo Measure

    // Agregar datos al archivo Excel
    measures.forEach((measure) => {
      measure.createdAt = measure.createdAt.toLocaleString()
      worksheet.addRow([measure.value, measure.createdAt]) // Ajusta los campos según tu modelo Measure
    })

    // Configurar la respuesta para descargar el archivo Excel
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', 'attachment; filename=medidas.xlsx')

    // Escribir el libro de Excel en el flujo de respuesta
    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('Error al recuperar medidas:', err)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
}

const measureByID = async (req, res, next, id) => {
  try {
    const measure = await Measure.findById(id)
    if (!measure) {
      return res.status(400).json({
        error: 'Measure not found'
      })
    }
    req.measure = measure
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve measure'
    })
  }
}

const find = async (req, res) => {
  const measure = req.measure
  try {
    res.json(measure)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * List all measures or filter by query parameters
 */
const list = async (req, res) => {
  try {
    const measures = await Measure.find({ ...req.query })
    res.json(measures)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Create a new measure
 */
const create = async (req, res) => {
  const measure = new Measure(req.body)
  const virtualPinsUsed = await Measure.find({ customer: req.body.customer })
  const result = virtualPinsUsed.filter(
    (virtualPin) => virtualPin.virtualPin === req.body.virtualPin
  )

  try {
    if (result.length > 0) {
      return res.status(400).json({
        message: 'Virtual Pin already exists',
        data: measure
      })
    }

    await measure.save()

    return res.status(200).json({
      message: 'Measure Successfully created!',
      data: measure
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Update an existing measure
 */
const update = async (req, res) => {
  try {
    let measure = req.measure
    measure = extend(measure, req.body)
    measure.updated = Date.now
    await measure.save()
    res.json(measure)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Delete a measure
 */
const remove = async (req, res) => {
  try {
    const measure = req.measure
    const deletedMeasure = await measure.remove()
    res.json(deletedMeasure)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  list,
  create,
  remove,
  update,
  measureByID,
  find,
  getByPeriod,
  rawData,
  getFirstAndLastDate
}
