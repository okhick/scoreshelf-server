import { Request, Response, NextFunction } from 'express';
import { AccessToken } from '../models/AccessToken';

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  if (!req.token) res.sendStatus(403);
  const accessToken = await AccessToken.findOne({ token: req.token });

  if (accessToken) {
    next();
  } else {
    res.sendStatus(403);
  }
}
