import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ApiError from 'error/ApiError';

export default {
  validatePublisher: function (req: Request, res: Response, next: NextFunction) {
    if (typeof req.query.name !== 'string') {
      next(ApiError.badData('NAME SHOULD BE TYPE STRING'));
      return;
    }

    next();
  },

  getPublisherData: function (req: Request, res: Response, next: NextFunction) {
    if (!mongoose.Types.ObjectId.isValid(<string>req.query?.id)) {
      next(ApiError.badData('ID NOT VALID'));
      return;
    }

    next();
  },

  addNewPublisher: function (req: Request, res: Response, next: NextFunction) {
    const isValid =
      typeof req.body.sharetribe_user_id === 'string' &&
      typeof req.body.name === 'string' &&
      typeof req.body.about === 'string';

    if (!isValid) {
      next(ApiError.badData('MALFORMED REQUEST'));
      return;
    }

    next();
  },

  updatePublisher: function (req: Request, res: Response, next: NextFunction) {
    const isValid =
      mongoose.Types.ObjectId.isValid(req.body._id) &&
      typeof req.body.sharetribe_user_id === 'string' &&
      typeof req.body.name === 'string' &&
      typeof req.body.about === 'string';

    if (!isValid) {
      next(ApiError.badData('MALFORMED REQUEST'));
      return;
    }

    next();
  },
};
