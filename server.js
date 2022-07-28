import config from './config/config.js';
import app from './express.js';
import mongoose from 'mongoose';

app.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info('Server started on port %s.', config.port);
});

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`);
});

