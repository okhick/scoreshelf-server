import mongoose, { Schema, Document } from 'mongoose';
import { Asset, Thumbnail } from '../@types';

const thumbnailSchema = new Schema({
  sharetribe_user_id: String,
  sharetribe_listing_id: String,
  asset_name: String,
  page: Number,
  date_added: { type: Date, default: Date.now },
});

const assetSchema = new Schema({
  sharetribe_user_id: String,
  sharetribe_listing_id: String,
  asset_name: String,
  size: Number,
  link: String,
  thumbnail_settings: { type: Schema.Types.ObjectId, ref: 'Generated' },
  date_added: { type: Date, default: Date.now },
});

export const AssetModel = mongoose.model<Asset>('Asset', assetSchema);
export const ThumbnailModel = mongoose.model<Thumbnail>('Generated', thumbnailSchema);

// export default { AssetModel, ThumbnailModel };
