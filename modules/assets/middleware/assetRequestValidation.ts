import { Request, Response, NextFunction } from 'express';

export default {
  uploadAssets: function (req: Request, res: Response, next: NextFunction) {
    const receivedFiles = req.files;
    const receivedBody = JSON.parse(req.body.assetMetadata);

    if (receivedFiles === undefined) {
      res.status(400).json({ message: 'NO FILES UPLOADED' });
    }
    if (
      typeof receivedBody.sharetribe_listing_id === 'string' &&
      typeof receivedBody.sharetribe_user_id === 'string' &&
      receivedBody.metadata
    ) {
      next();
    } else {
      res.status(400).json({ message: 'MALFORMED ASSETMETADATA' });
    }
  },
};
