import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export default {
  validatePublisher: function (req: Request, res: Response, next: NextFunction) {
    if (typeof req.query.name === 'string') {
      next();
    } else {
      res.status(400).json('INVALID NAME FORMAT. PLEASE USE STRING.');
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
      res.status(400).json({ message: 'MALFORMED REQUEST' });
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
      res.status(400).json({ message: 'MALFORMED REQUEST' });
    }
  },
};
