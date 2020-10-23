import { AssetIO } from '../controllers/asset-io';
import { AssetDB } from '../controllers/asset-db';
import { Asset2Thumbnail } from './asset2thumbnail';

import { Request } from 'express';
import { DeleteAssetRequest, UploadRequest, UploadResponse } from '../@types';
import { resolve } from 'path';

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
            await this.newThumbnail(upload);
          }

          await assetIo.saveAssetFile(upload);
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
        await assetDb.deleteAssetData(file._id);
        await assetIo.deleteAssetFile(
          `${file.sharetribe_user_id}/${file.sharetribe_listing_id}/${file.asset_name}`
        );
        deletedFiles.push(file._id);
      })
    );

    return deletedFiles;
  }

  async newThumbnail(asset: UploadRequest) {
    const asset2thumbnail = new Asset2Thumbnail();

    const pageToConvertAsImage = asset.thumbnailSettings.page;
    const PDF = asset.file.data;
    const pdfName = asset.file.name;
    const thumbnailFilePath = await asset2thumbnail.makePdfThumbnail(
      PDF,
      pdfName,
      pageToConvertAsImage
    );
    console.log(thumbnailFilePath);
    return;
  }
}
