import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  temperature: {
    type: String,
  },
  humidity: {
    type: String,
  },
  updated: Date,
});

export default mongoose.model('User', UserSchema);