import Express from 'express';
import Mongoose from 'mongoose';

const port = 3000;
const app = Express();
module.exports = app;

console.log()

// these export a function that takes the argument 'app'. that's what's going on here.
// is this dependency injecting?
// make sure to load the express before the routes otherwise things can get weird...
require('./config/express')(app);
require('./modules/assets')(app);

connect();

function listen() {
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect() {
  Mongoose.connection
    .on('error', console.log)
    // .on('disconnected', connect) // reconnect if disconnected
    .once('open', listen); // spin up express when connected to mongo

  return Mongoose.connect("mongodb+srv://scoreshelf:theshelf@cluster0.3ktpg.mongodb.net/scoreshelf?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}