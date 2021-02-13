import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ApiError from 'error/ApiError';

export default {
  validatePublisher: function (req: Request, res: Response, next: NextFunction) {
    if (typeof req.query.name === 'string') {
      next();
    } else {
      next(ApiError.badData('NAME SHOULD BE TYPE STRING'));
      return;
    }
  },

  addNewPublisher: function (req: Request, res: Response, next: NextFunction) {
    const isValid =
      typeof req.body.sharetribe_user_id === 'string' &&
      typeof req.body.name === 'string' &&
      typeof req.body.about === 'string';

    if (isValid) {
      next();
    } else {
      next(ApiError.badData('MALFORMED REQUEST'));
      return;
    }
  },

  updatePublisher: function (req: Request, res: Response, next: NextFunction) {
    const isValid =
      mongoose.Types.ObjectId.isValid(req.body._id) &&
      typeof req.body.sharetribe_user_id === 'string' &&
      typeof req.body.name === 'string' &&
      typeof req.body.about === 'string';

    if (isValid) {
      next();
    } else {
      next(ApiError.badData('MALFORMED REQUEST'));
      return;
    }
  },
};
