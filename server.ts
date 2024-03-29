import Express from 'express';
import Mongoose from 'mongoose';

import * as dotenv from 'dotenv';
dotenv.config();

const port = 3000;
const app = Express();

// put all global express middleware here
import config from './config/express';

// modules exporting a Router instance
import assets from 'assets/index';
import auth from 'auth/index';
import sharetribe from 'sharetribe/index';
import publisher from 'publisher/index';
import errorHandler from 'error/errorHandler';

// make sure to load the config before the routes otherwise things can get weird...
app.use(config);

// then load your Routers
app.use('/assets', assets);
app.use('/auth', auth);
app.use('/sharetribe', sharetribe);
app.use('/publisher', publisher);

// Do this last to be sure we can catch all errors
app.use(errorHandler);

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
