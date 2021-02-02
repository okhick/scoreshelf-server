import Express from 'express';
import Mongoose from 'mongoose';

import * as dotenv from 'dotenv';
dotenv.config();

const port = 3000;
const app = Express();
module.exports = app;

// these export a function that takes the argument 'app'. that's what's going on here.
// is this dependency injecting?
// require('./config/express')(app);

import config from './config/express';
import assets from './modules/assets';
import auth from './modules/auth';

// make sure to load the config before the routes otherwise things can get weird...
app.use(config);
app.use('/assets', assets);
app.use('/auth', auth);

connect();

function connect() {
  Mongoose.connection
    // .on('disconnected', connect) // reconnect if disconnected
    .on('error', console.log)
    // spin up express when connected to mongo
    .once('open', () => {
      app.listen(port);
      console.log('Express app started on port ' + port);
    });

  return Mongoose.connect(<string>process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
