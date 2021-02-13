import { Request, Response, NextFunction } from 'express';
import ApiError from 'error/ApiError';

export default {
  generateAuthCode: function (req: Request, res: Response, next: NextFunction) {
    if (typeof req.body.client_id !== 'string' || typeof req.body.code_challenge !== 'string') {
      next(ApiError.badData('CLIENT_ID AND CHALLENGE SHOUD BE STRINGS'));
      return;
    }

    next();
  },

  generateAccessToken: function (req: Request, res: Response, next: NextFunction) {
    if (typeof req.body.client_id !== 'string' || typeof req.body.code_verifier !== 'string') {
      next(ApiError.badData('CLIENT_ID AND VERIFIER SHOUD BE STRINGS'));
      return;
    }
    if (!req.headers?.authorization) {
      next(ApiError.badData('AUTH CODE NOT PRESENT'));
      return;
    }

    next();
  },
};
