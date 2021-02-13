import mongoose, { Schema, Document } from 'mongoose';
import { Asset, Thumbnail, ProfilePicture } from 'assets/@types';

const thumbnailSchema = new Schema({
  sharetribe_user_id: String,
  sharetribe_listing_id: String,
  asset_name: String,
  page: Number,
  height: Number,
  width: Number,
  date_added: { type: Date, default: Date.now },
});

const profilePictureSchema = new Schema({
  sharetribe_user_id: String,
  asset_name: String,
  date_added: { type: Date, default: Date.now },
});

const assetSchema = new Schema({
  sharetribe_user_id: String,
  sharetribe_listing_id: String,
  asset_name: String,
  size: Number,
  link: String,
  thumbnail_settings: { type: Schema.Types.ObjectId, ref: 'asset_generated' },
  date_added: { type: Date, default: Date.now },
});

export const AssetModel = mongoose.model<Asset>('asset_asset', assetSchema);
export const ThumbnailModel = mongoose.model<Thumbnail>('asset_generated', thumbnailSchema);
export const ProfilePictureModel = mongoose.model<ProfilePicture>(
  'asset_profile',
  profilePictureSchema
);

// export default { AssetModel, ThumbnailModel };
