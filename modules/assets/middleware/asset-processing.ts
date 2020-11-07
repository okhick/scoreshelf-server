import { AssetIO } from '../controllers/asset-io';
import { AssetDB } from '../controllers/asset-db';
import { Asset2Thumbnail } from './asset2thumbnail';
import { parse, format } from 'path';
import { unlinkSync, readFileSync } from 'fs';

import { Request } from 'express';
import {
  Asset,
  UploadRequest,
  UpdateRequest,
  UploadThumbnailRequest,
  UpdateThumbnailResponse,
  UploadResponse,
  Thumbnail,
} from '../@types';
import { AssetModel, ThumbnailModel } from '../models/Asset';

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
            thumbnailSettings: data.metadata[assets[assetKey].name].thumbnailSettings,
          };

          response[upload.file.name] = { _id: '' };

          if (upload.thumbnailSettings.isThumbnail) {
            const processThumbnailRequest = {
              file: assets[assetKey].data,
              filename: assets[assetKey].name,
              sharetribe_user_id: data.sharetribe_user_id,
              sharetribe_listing_id: data.sharetribe_listing_id,
              page: data.metadata[assets[assetKey].name].thumbnailSettings.page,
            };
            const thumbnailDoc = await this.processThumbnail(processThumbnailRequest);

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

  async processThumbnail(upload: UploadThumbnailRequest): Promise<Thumbnail> {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    // delete anything that already exists, needed?
    // const thumbnailDeleted = await this.deleteThumbnail(upload);

    const tempThumbPath = await this.newThumbnail(upload);
    const thumbUpload: UploadThumbnailRequest = {
      file: readFileSync(format(tempThumbPath)),
      filename: tempThumbPath.base,
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      page: upload.page,
    };

    const s3Res = await assetIo.saveThumbnailFile(thumbUpload);
    const mongoRes = await assetDb.saveThumbnailData(thumbUpload);

    // delete the temp file
    unlinkSync(format(tempThumbPath));

    return mongoRes;
  }

  async makeNewThumbnail(updateRequest: UpdateRequest): Promise<boolean | UpdateThumbnailResponse> {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const updateMetadata = updateRequest.metadata;

    // get the asset attached to this thumbnail
    let assetForThumbnail = '';
    for (const asset in updateMetadata) {
      if (updateMetadata[asset].thumbnailSettings.page) {
        assetForThumbnail = asset;
      }
    }
    const assetDocForThumbnail = await assetDb.getAssetData({
      ids: [assetForThumbnail],
      getLink: false,
      getType: 'asset',
    });
    const firstAssetDoc = <Asset>assetDocForThumbnail[0]; // There should only be one

    if (firstAssetDoc != null) {
      // download the asset
      const assetBufferForThumbnail = await assetIo.getAsset(firstAssetDoc);

      // process the thumbnail
      const newThumbnailData = await this.processThumbnail({
        file: assetBufferForThumbnail,
        filename: firstAssetDoc.asset_name,
        sharetribe_user_id: updateRequest.sharetribe_user_id,
        sharetribe_listing_id: updateRequest.sharetribe_listing_id,
        page: updateMetadata[firstAssetDoc._id].thumbnailSettings.page,
      });

      // delete old thumbnail if it exists
      if (firstAssetDoc.thumbnail_settings != null) {
        await this.deleteThumbnail(firstAssetDoc.thumbnail_settings._id);
      }

      // return the new thumbnail to updating with asset
      return {
        _id: firstAssetDoc._id,
        thumbnail: newThumbnailData,
      };
    }
    return false;
  }

  async deleteThumbnail(thumbnail_id: string) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const thumbnailDeleted = await assetDb.deleteAssetData(thumbnail_id, 'thumbnail');
    if (thumbnailDeleted) assetIo.deleteFile(thumbnailDeleted);

    return thumbnailDeleted;
  }

  async newThumbnail(asset: UploadThumbnailRequest) {
    const asset2thumbnail = new Asset2Thumbnail();

    const thumbnailFilePath = await asset2thumbnail.makePdfThumbnail(
      asset.file,
      parse(asset.filename).name,
      asset.page
    );

    return thumbnailFilePath;
  }
}
