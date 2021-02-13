import ApiError from 'error/ApiError';
import { Request, Response, NextFunction } from 'express';

export default function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // TODO: don't spit these to the console in prod...
  console.log(err);

  if (err instanceof ApiError) {
    res.status(err.code).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: 'SOMETHING UNKNOWN WENT WRONG. SORRY...' });
}
