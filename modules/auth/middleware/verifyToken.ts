import { Request, Response, NextFunction } from 'express';
import { AccessToken } from 'auth/models/AccessToken';
import ApiError from 'error/ApiError';

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  if (!req.token) {
    next(ApiError.authFailed('AUTH FAILED'));
    return;
  }

  const accessToken = await AccessToken.findOne({ token: req.token });

  if (!accessToken) {
    next(ApiError.authFailed('AUTH FAILED'));
    return;
  }

  next();
}
