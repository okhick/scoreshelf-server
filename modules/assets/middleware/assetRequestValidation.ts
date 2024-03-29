import { Request, Response, NextFunction } from 'express';
import { AssetMetadata } from '../@types';
import ApiError from 'error/ApiError';
import mongoose from 'mongoose';

export default {
  uploadAssets: function (req: Request, res: Response, next: NextFunction) {
    const receivedFiles = req.files;
    const receivedBody = JSON.parse(req.body.assetMetadata);

    if (receivedFiles === undefined) {
      next(ApiError.noFiles('NO FILES UPLOADED'));
      return;
    }
    if (
      typeof receivedBody.sharetribe_listing_id !== 'string' &&
      typeof receivedBody.sharetribe_user_id !== 'string' &&
      !receivedBody.metadata
    ) {
      next(ApiError.badData('MALFORMED ASSETMETADATA'));
      return;
    }

    next();
  },

  uploadProfilePicture: function (req: Request, res: Response, next: NextFunction) {
    const receivedFiles = req.files;
    const receivedBody: AssetMetadata = JSON.parse(req.body.assetMetadata);

    if (receivedFiles === undefined) {
      next(ApiError.noFiles('NO FILES UPLOADED'));
      return;
    }
    if (typeof receivedBody.sharetribe_user_id !== 'string') {
      next(ApiError.badData('NEED USER ID'));
      return;
    }

    next();
  },

  getAssetData: function (req: Request, res: Response, next: NextFunction) {
    const receivedBody = req.query;

    const ids = receivedBody.scoreshelf_ids;
    if (!Array.isArray(ids) || typeof ids[0] !== 'string') {
      next(ApiError.badData('IDS SHOULD BE TYPE STRING[]'));
      return;
    }
    if (typeof JSON.parse(<string>receivedBody.getLink) !== 'boolean') {
      next(ApiError.badData('GETLINK SHOULD BE BOOLEAN'));
      return;
    }
    const getTypes = ['asset', 'thumbnail', 'profile'];
    if (!getTypes.includes(<string>receivedBody.getType)) {
      next(ApiError.badData('GETTYPE NOT VALID'));
      return;
    }

    next();
  },

  getAssetBin: function (req: Request, res: Response, next: NextFunction) {
    if (typeof req.query.scoreshelf_id !== 'string') {
      next(ApiError.badData('IDS SHOULD BE TYPE STRING'));
      return;
    }

    next();
  },

  getThumbnailData: function (req: Request, res: Response, next: NextFunction) {
    if (!Array.isArray(req.query.scoreshelf_ids)) {
      next(ApiError.badData('IDS SHOULD BE TYPE STRING[]'));
      return;
    }

    next();
  },

  updateAssetMetadata: function (req: Request, res: Response, next: NextFunction) {
    const request = req.body;

    if (
      typeof request.sharetribe_listing_id !== 'string' ||
      typeof request.sharetribe_user_id !== 'string'
    ) {
      next(ApiError.badData('IDS SHOULD BE TYPE STRING[]'));
      return;
    }

    const metadataIds = Object.keys(request.metadata);
    if (!request.metadata) {
      next(ApiError.badData('NEED SOME METADATA'));
      return;
    }
    for (const id of metadataIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        next(ApiError.badData('SCORESHELF ID NOT VALID'));
        return;
      } else if (typeof request.metadata[id] !== 'object') {
        next(ApiError.badData('METADATA[ID] SHOULD BE OBJECT'));
        return;
      }
    }

    next();
  },

  deleteAssets: function (req: Request, res: Response, next: NextFunction) {
    const request = req.body;

    if (!request.filesToRemove || !Array.isArray(request.filesToRemove)) {
      next(ApiError.badData('FILESTOREMOVE MUST BE TYPE ASSET[]'));
      return;
    }

    // TODO: Validate full Asset type here.
    for (const file of request.filesToRemove) {
      if (!file._id || !mongoose.Types.ObjectId.isValid(file._id)) {
        next(ApiError.badData('FILESTOREMOVE MUST BE TYPE ASSET[]'));
        return;
      }
    }
    next();
  },
};
