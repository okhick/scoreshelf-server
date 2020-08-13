const Express = require('express');
const Mongoose = require("mongoose");

const port = 3001;
const app = Express();
module.exports = app;

// these export a function that takes the argument 'app'. that's what's going on here.
// make sure to load the express before the routes otherwise things can get weird...
require('./config/express')(app);
require('./config/routes')(app);

connect();

function listen() {
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect() {
  Mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect) // reconnect if disconnected
    .once('open', listen); // spin up express when connected to mongo

  return Mongoose.connect("mongodb://localhost:27017/scoreshelf", {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
    auth: {
      user: 'root',
      password: 'root'
    }
  });
}