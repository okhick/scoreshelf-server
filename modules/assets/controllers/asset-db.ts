import AssetModel from '../models/Asset';
const S3 = require('../middleware/s3.js');

import { Asset, AssetDataRequest, HydratedAsset, UploadRequest } from '../types';

export class AssetDB {
  async saveAssetData(upload: UploadRequest): Promise<Asset> {
    const newAsset = new AssetModel({
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      asset_name: upload.file.name,
      size: upload.file.size,
    });
    const newAssetRes = await newAsset.save();
    return newAssetRes;
  }

  async getAssetData(dataRequest: AssetDataRequest): Promise<any> {
    return Promise.all(dataRequest.ids.map(async (id) => {
      const assetData = await AssetModel.findById(id.scoreshelf_id);
      if (dataRequest.getLink) { 
        const s3 = new S3();
        const link = await s3.getSignedUrl(assetData);
        // TODO FIX THIS
        // assetData._doc.link = link;
      }
      return assetData;
    }));
  }

  async deleteAssetData(id: string): Promise<any> {
    let res = await AssetModel.findOneAndDelete({_id: id});
    return res;
  }
}