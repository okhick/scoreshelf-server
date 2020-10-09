// ===================================
// Basic middlewear
// ===================================

import { Application } from "express";

import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';

module.exports = function(app: Application) {
  // stuff to parse requests
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(fileUpload());
  app.use(cors());
}