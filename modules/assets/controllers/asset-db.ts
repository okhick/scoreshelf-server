import { AssetModel, ThumbnailModel } from '../models/Asset';
import { S3 } from '../middleware/s3';

import {
  Asset,
  Thumbnail,
  AssetDataRequest,
  UploadRequest,
  UpdateRequest,
  UploadThumbnailRequest,
} from '../@types';

export class AssetDB {
  async saveAssetData(upload: UploadRequest): Promise<Asset> {
    const newAsset = new AssetModel({
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      asset_name: upload.file.name,
      size: upload.file.size,
      thumbnail_settings: {
        isThumbnail: upload.thumbnailSettings.isThumbnail,
        page: upload.thumbnailSettings.page,
      },
    });
    const newAssetRes = await newAsset.save();
    return newAssetRes;
  }

  async saveThumbnailData(upload: UploadThumbnailRequest): Promise<Thumbnail> {
    const newThumbnail = new ThumbnailModel({
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      asset_name: `thumb.${upload.filename}`,
      page: upload.page,
    });
    const newThumbnailRes = await newThumbnail.save();
    return newThumbnailRes;
  }

  async getAssetData(dataRequest: AssetDataRequest): Promise<(Asset | Thumbnail | null)[]> {
    return Promise.all(
      dataRequest.ids.map(
        async (id): Promise<Asset | Thumbnail | null> => {
          let assetData;
          switch (dataRequest.getType) {
            case 'asset':
              assetData = await AssetModel.findById(id);
              break;

            case 'thumbnail':
              assetData = await ThumbnailModel.findOne({ sharetribe_listing_id: id });
              break;
          }
          if (dataRequest.getLink && assetData != null) {
            assetData.link = this.getSignedUrl(assetData);
          }
          return assetData;
        }
      )
    );
  }

  async updateAssetData(newData: UpdateRequest) {
    // right now this just updates thumbnail data
    const scoreshelf_ids = Object.keys(newData.thumbnailSettings);

    return Promise.all(
      scoreshelf_ids.map(
        async (id): Promise<Asset | boolean> => {
          let newAssetData = newData.thumbnailSettings[id];
          let thisAssetDoc = await AssetModel.findOne({ _id: id });

          if (thisAssetDoc != null) {
            thisAssetDoc.thumbnail_settings = newAssetData;
            const updatedAsset = await thisAssetDoc.save();
            return updatedAsset;
          }

          return false;
        }
      )
    );
  }

  async deleteAssetData(id: string): Promise<Asset | null> {
    let res = await AssetModel.findOneAndDelete({ _id: id });
    return res;
  }

  getSignedUrl(assetData: Asset | Thumbnail): string {
    const s3 = new S3();
    const link = s3.getSignedUrl(assetData);
    return link;
  }
}
