import { AssetIO } from '../controllers/asset-io';
import { AssetDB } from '../controllers/asset-db';
import { Asset2Thumbnail } from './asset2thumbnail';
import { parse, format } from 'path';
import { unlinkSync, readFileSync } from 'fs';

import { Request } from 'express';
import {
  DeleteAssetRequest,
  UploadRequest,
  UploadThumbnailRequest,
  UploadResponse,
} from '../@types';

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

          if (upload.thumbnailSettings.isThumbnail) {
            await this.processThumbnail(upload);
          }

          const s3Res = await assetIo.saveAssetFile(upload);
          const mongoRes = await assetDb.saveAssetData(upload);
          response[mongoRes.asset_name] = { _id: mongoRes._id };
        })
      );
    }
    return response;
  }

  async deleteAssets(assets: DeleteAssetRequest) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const deletedFiles: String[] = [];
    await Promise.all(
      assets.filesToRemove.map(async (file) => {
        const assetToBeDeleted = await assetDb.deleteAssetData(file._id, 'asset');
        if (assetToBeDeleted) {
          await assetIo.deleteAssetFile(assetToBeDeleted);
        }
        deletedFiles.push(file._id);
      })
    );

    return deletedFiles;
  }

  async processThumbnail(upload: UploadRequest): Promise<void> {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    // delete anything that already exists
    const thumbnailDeleted = await this.deleteThumbnail(upload);

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

    return;
  }

  async deleteThumbnail(upload: UploadRequest) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const thumbnailDeleted = await assetDb.deleteAssetData(
      upload.sharetribe_listing_id,
      'thumbnail'
    );
    if (thumbnailDeleted) {
      assetIo.deleteAssetFile(thumbnailDeleted);
    }

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
