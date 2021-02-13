// middleware to check for a valid object id in the url
// const checkObjectId = (idToCheck) => (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params[idToCheck]))
//     return res.status(400).json({ msg: 'Invalid ID' });
//   next();
// };

import { Request, Response, NextFunction } from 'express';

// export async function verifyToken(req: Request, res: Response, next: NextFunction) {
//   if (!req.token) res.sendStatus(403);

//   const accessToken = await AccessToken.findOne({ token: req.token });

//   if (accessToken) {
//     next();
//   } else {
//     res.sendStatus(403);
//   }
// }

export default {
  validatePublisher: function (req: Request, res: Response, next: NextFunction) {
    if (typeof req.query === 'string') {
      next();
    } else {
      res.status(400).json('INVALID NAME FORMAT. PLEASE USE STRING');
    }
  },
};
