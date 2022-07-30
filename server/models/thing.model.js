import 'mongoose-geojson-schema'
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ThingSchema = new Schema(
  {
    name: {
      type: String
    },
    mac: {
      type: String
    },
    geometry: {
      type: mongoose.Schema.Types.GeoJSON,
      index: '2dsphere'
    },
    googleMapsUrl: {
      type: String
    }
  },
  { timestamps: true }
)

export default mongoose.model('Thing', ThingSchema)
