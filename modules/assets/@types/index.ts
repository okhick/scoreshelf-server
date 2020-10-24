import { UploadedFile } from 'express-fileupload';
import { Document } from 'mongoose';

// Extend the Mongoose document with Assest things
export interface Asset extends Document {
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
  asset_name: string;
  size: number;
  date_added: Date;
  link?: string | null;
  thumbnail_settings?: {
    isThumbnail: Boolean;
    page: Number;
  };
}

export interface Thumbnail extends Document {
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
  asset_name: string;
  date_added: Date;
  link?: string | null;
}

export interface AssetDataRequest {
  ids: string[];
  getLink: boolean;
  getType: 'asset' | 'thumbnail';
}

export interface DeleteAssetRequest {
  filesToRemove: FileToRemove[];
}

export interface FileToRemove {
  _id: Asset['_id'];
  sharetribe_user_id: Asset['sharetribe_user_id'];
  sharetribe_listing_id: Asset['sharetribe_listing_id'];
  asset_name: Asset['asset_name'];
}

export interface UploadRequest {
  file: UploadedFile;
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
  thumbnailSettings: {
    isThumbnail: boolean;
    page: number;
  };
}

export interface UploadThumbnailRequest {
  file: Buffer;
  filename: string;
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
  page: number;
}

export interface UpdateRequest {
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
  thumbnailSettings: {
    [key: string]: { isThumbnail: boolean; page: number };
  };
}

export interface UploadResponse {
  [key: string]: { _id: string };
}
