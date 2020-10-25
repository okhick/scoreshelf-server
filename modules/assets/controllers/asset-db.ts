import { AssetModel, ThumbnailModel } from '../models/Asset';
import { AssetIO } from './asset-io';

import {
  Asset,
  Thumbnail,
  AssetDataRequest,
  UploadRequest,
  UpdateRequest,
  UploadThumbnailRequest,
  GenericAsset,
} from '../@types';

export class AssetDB {
  async saveAssetData(upload: UploadRequest): Promise<Asset> {
    const newAsset = new AssetModel({
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      asset_name: upload.file.name,
      size: upload.file.size,
      thumbnail_settings: upload.thumbnailSettings.thumbnail_id,
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

  async getAssetData(dataRequest: AssetDataRequest): Promise<(GenericAsset | null)[]> {
    return Promise.all(
      dataRequest.ids.map(
        async (id): Promise<GenericAsset | null> => {
          let assetData;
          switch (dataRequest.getType) {
            case 'asset':
              assetData = await AssetModel.findById(id).populate('thumbnail_settings');
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
    const scoreshelf_ids = Object.keys(newData.metadata);
    const updatedMetadata: any = {};
    return Promise.all(
      scoreshelf_ids.map(
        async (id): Promise<any | null> => {
          updatedMetadata[id] = {
            newThumbnailData: await this.updateThumbnailData(
              id,
              newData.metadata[id].thumbnailSettings
            ),
            // do more updating here
          };
          return updatedMetadata;
        }
      )
    );
  }

  async updateThumbnailData(asset_id: string, newAssetData: any): Promise<Thumbnail | null> {
    // if it's not a thumbnail delete
    if (!newAssetData.isThumbnail) {
      await this.deleteAssetData(newAssetData.thumbnail_id, 'thumbnail');
      await AssetModel.updateOne({ _id: asset_id }, { thumbnail_settings: undefined });
      return null;
    }

    let thumbnailDoc = await ThumbnailModel.findOne({ _id: newAssetData.thumbnail_id });

    if (thumbnailDoc != null) {
      thumbnailDoc.page = newAssetData.page;
      const newThumbnailDoc = await thumbnailDoc.save();
      return newThumbnailDoc;
    }

    return thumbnailDoc;
  }

  async deleteAssetData(id: string, deleteType: string): Promise<GenericAsset | null> {
    let res = null;
    switch (deleteType) {
      case 'asset':
        res = await AssetModel.findOneAndDelete({ _id: id }).populate('thumbnail_settings');
        break;
      case 'thumbnail':
        res = await ThumbnailModel.findOneAndDelete({ _id: id });
        break;
    }
    return res;
  }
}
