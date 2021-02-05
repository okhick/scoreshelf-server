import { AssetModel, ProfilePictureModel, ThumbnailModel } from '../models/Asset';
import { AssetIO } from './asset-io';

import {
  Asset,
  Thumbnail,
  ProfilePicture,
  AssetDataRequest,
  UploadRequest,
  UploadThumbnailRequest,
  GenericAsset,
  UpdateThumbnailResponse,
  UploadProfilePictureRequest,
} from '../@types';

export class AssetDB {
  // =============================
  // ========== Setters ==========
  // =============================

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

  async saveThumbnailData(upload: UploadThumbnailRequest): Promise<Thumbnail> {
    const assetIo = new AssetIO();
    const newThumbnail = new ThumbnailModel({
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      asset_name: `${assetIo.THUMBNAIL_PREFIX}.${upload.filename}`,
      height: upload.height,
      width: upload.width,
      page: upload.page,
    });
    const newThumbnailRes = await newThumbnail.save();
    return newThumbnailRes;
  }

  async saveProfilePictureData(upload: UploadProfilePictureRequest): Promise<ProfilePicture> {
    const newProfilePicture = new ProfilePictureModel({
      sharetribe_user_id: upload.sharetribe_user_id,
      asset_name: upload.file.name,
    });
    const newProfilePictureRes = await newProfilePicture.save();
    return newProfilePictureRes;
  }

  async updateThumbnailData(
    assetsToUpdate: Asset[],
    updatedThumbnails: UpdateThumbnailResponse[]
  ): Promise<Asset[]> {
    const updatedAssets = await Promise.all(
      assetsToUpdate.map(async (asset) => {
        const newThumbnailFilter = updatedThumbnails.filter((thumb) => asset._id.equals(thumb._id));
        const newThumbnail = newThumbnailFilter[0].thumbnail;
        asset.thumbnail_settings = newThumbnail;
        return await asset.save();
      })
    );

    return updatedAssets;
  }

  // =============================
  // ========== Getters ==========
  // =============================

  async getAssetData(
    dataRequest: AssetDataRequest
  ): Promise<(Asset | Thumbnail | ProfilePicture | null)[]> {
    return Promise.all(
      dataRequest.ids.map(
        async (id): Promise<Asset | Thumbnail | null> => {
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
              assetData = await ThumbnailModel.findById(id);
              break;

            case 'profile':
              assetData = await ProfilePictureModel.findById(id);
              break;
          }
          return assetData;
        }
      )
    );
  }

  async getAssetDataByListing(sharetribe_listing_id: string) {
    const assets = await AssetModel.find({ sharetribe_listing_id: sharetribe_listing_id }).populate(
      'thumbnail_settings'
    );
    return assets;
  }

  async getProfilePictureDataByUser(sharetribe_user_id: string) {
    const picture = await ProfilePictureModel.findOne({ sharetribe_user_id: sharetribe_user_id });
    return picture;
  }

  // ==============================
  // ========== Deleters ==========
  // ==============================

  async deleteAssetData(id: string, deleteType: string): Promise<GenericAsset | null> {
    let res = null;
    switch (deleteType) {
      case 'asset':
        res = await AssetModel.findOneAndDelete({ _id: id }).populate('thumbnail_settings');
        break;
      case 'thumbnail':
        res = await ThumbnailModel.findOneAndDelete({ _id: id });
        break;
      case 'profile':
        res = await ProfilePictureModel.findByIdAndDelete({ _id: id });
        break;
    }
    return res;
  }
}
