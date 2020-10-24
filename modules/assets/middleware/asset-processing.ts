import { AssetIO } from '../controllers/asset-io';
import { AssetDB } from '../controllers/asset-db';
import { Asset2Thumbnail } from './asset2thumbnail';
import { parse, format } from 'path';
import { unlinkSync, readFileSync } from 'fs';

import { Request } from 'express';
import { Asset, UploadRequest, UploadThumbnailRequest, UploadResponse, Thumbnail } from '../@types';
import { AssetModel } from '../models/Asset';

export class AssetProcessing {
  async uploadAssets(assets: Request['files'], data: any) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const response: UploadResponse = {};

    if (assets) {
      const assetKeys = Object.keys(assets);
      await Promise.all(
        assetKeys.map(async (assetKey) => {
          const upload: UploadRequest = {
            file: assets[assetKey],
            sharetribe_user_id: data.sharetribe_user_id,
            sharetribe_listing_id: data.sharetribe_listing_id,
            thumbnailSettings: data.thumbnailSettings[assets[assetKey].name],
          };

          response[upload.file.name] = { _id: '' };

          if (upload.thumbnailSettings.isThumbnail) {
            const thumbnailDoc = await this.processThumbnail(upload);
            upload.thumbnailSettings.thumbnail_id = thumbnailDoc._id;
            response[upload.file.name].thumbnail_id = thumbnailDoc._id;
          } else {
            upload.thumbnailSettings.thumbnail_id = null;
          }

          const s3Res = await assetIo.saveAssetFile(upload);
          const assetDoc = await assetDb.saveAssetData(upload);
          response[upload.file.name]._id = assetDoc._id;
        })
      );
    }
    return response;
  }

  async deleteAssets(assets: Asset[]) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const deletedFiles: String[] = [];
    await Promise.all(
      assets.map(async (file) => {
        // first delete the data but also get the document that was deleted
        const assetToBeDeleted = await assetDb.deleteAssetData(file._id, 'asset');
        // then delete that asset
        if (assetToBeDeleted) await assetIo.deleteFile(assetToBeDeleted);
        // if there was an asset, there might have been a thumbnail, check for it and delete
        if (assetToBeDeleted instanceof AssetModel && assetToBeDeleted.thumbnail_settings) {
          const thumbToDelete = await assetDb.deleteAssetData(
            assetToBeDeleted.thumbnail_settings._id,
            'thumbnail'
          );
          if (thumbToDelete) await assetIo.deleteFile(thumbToDelete);
        }
        deletedFiles.push(file._id);
      })
    );

    return deletedFiles;
  }

  async processThumbnail(upload: UploadRequest): Promise<Thumbnail> {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    // delete anything that already exists
    if (upload.thumbnailSettings.thumbnail_id) {
      const thumbnailDeleted = await this.deleteThumbnail(upload);
    }

    const tempThumbPath = await this.newThumbnail(upload);
    const thumbUpload: UploadThumbnailRequest = {
      file: readFileSync(format(tempThumbPath)),
      filename: tempThumbPath.base,
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      page: upload.thumbnailSettings.page,
    };

    const s3Res = await assetIo.saveThumbnailFile(thumbUpload);
    const mongoRes = await assetDb.saveThumbnailData(thumbUpload);

    // delete the temp file
    unlinkSync(format(tempThumbPath));

    return mongoRes;
  }

  async deleteThumbnail(upload: UploadRequest) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const thumbnailDeleted = await assetDb.deleteAssetData(
      upload.sharetribe_listing_id,
      'thumbnail'
    );
    if (thumbnailDeleted) assetIo.deleteFile(thumbnailDeleted);

    return thumbnailDeleted;
  }

  async newThumbnail(asset: UploadRequest) {
    const asset2thumbnail = new Asset2Thumbnail();

    const thumbnailFilePath = await asset2thumbnail.makePdfThumbnail(
      asset.file.data,
      parse(asset.file.name).name,
      asset.thumbnailSettings.page
    );

    return thumbnailFilePath;
  }
}
