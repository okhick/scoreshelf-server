import { AssetIO } from '../controllers/asset-io';
import { AssetDB } from '../controllers/asset-db';
import { Asset } from '../@types';

import { Application, Request, Response } from 'express';
import {
  AssetDataRequest,
  DeleteAssetRequest,
  UploadRequest,
  UpdateRequest,
  UploadResponse,
} from '../@types';

export class AssetProcessing {
  async uploadAssets(assets: Request['files'], data: any) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const response: UploadResponse = {};

    for (const key in assets) {
      const upload: UploadRequest = {
        file: assets[key],
        sharetribe_user_id: data.sharetribe_user_id,
        sharetribe_listing_id: data.sharetribe_listing_id,
        thumbnailSettings: data.thumbnailSettings[assets[key].name],
      };

      await assetIo.saveAssetFile(upload);
      const mongoRes = await assetDb.saveAssetData(upload);
      response[mongoRes.asset_name] = { _id: mongoRes._id };
    }

    return response;
  }

  async deleteAssets(assets: DeleteAssetRequest) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const deletedFiles: String[] = [];
    Promise.all(
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
}
