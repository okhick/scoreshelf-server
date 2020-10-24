import { AssetModel, ThumbnailModel } from '../models/Asset';
import { AssetIO } from './asset-io';

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
    const assetIo = new AssetIO();
    const newThumbnail = new ThumbnailModel({
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      asset_name: `${assetIo.THUMBNAIL_PREFIX}.${upload.filename}`,
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
              if (dataRequest.getLink && assetData != null) {
                const assetIo = new AssetIO();
                assetData.link = assetIo.getSignedUrl(assetData);
              }
              break;

            case 'thumbnail':
              assetData = await ThumbnailModel.findOne({ sharetribe_listing_id: id });
              break;
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

  async deleteAssetData(id: string, deleteType: string): Promise<Asset | Thumbnail | null> {
    let res = null;
    switch (deleteType) {
      case 'asset':
        res = await AssetModel.findOneAndDelete({ _id: id });
        break;
      case 'thumbnail':
        res = await ThumbnailModel.findOneAndDelete({ sharetribe_listing_id: id });
        break;
    }
    return res;
  }
}
