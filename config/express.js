// ===================================
// Starts up the GraphQl Server. More middlewear might go here
// ===================================

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

module.exports = function(app) {
  // stuff to parse requests
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(fileUpload());
  app.use(cors());
}