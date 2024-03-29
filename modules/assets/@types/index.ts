import { UploadedFile } from 'express-fileupload';
import { Document } from 'mongoose';
import { ParsedPath } from 'path';

// Extend the Mongoose document with Assest things
export interface GenericAsset {
  sharetribe_user_id: string;
  sharetribe_listing_id?: string;
  asset_name: string;
  date_added: Date;
}

export interface Asset extends GenericAsset, Document {
  size: number;
  link?: string | null;
  thumbnail_settings?: Thumbnail;
}

export interface AssetMetadata {
  sharetribe_listing_id: string;
  sharetribe_user_id: string;
  metadata: {
    [key: string]: {
      thumbnailSettings: Thumbnail;
    };
  };
}

export interface Thumbnail extends GenericAsset, Document {
  page: number;
}

export interface ProfilePicture extends GenericAsset, Document {}

export interface UploadProfilePictureRequest {
  file: UploadedFile;
  sharetribe_user_id: string;
}

export interface AssetDataRequest {
  ids: string[];
  getLink: boolean;
  getType: 'asset' | 'thumbnail' | 'profile';
}

export interface UploadRequest {
  file: UploadedFile;
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
}

export interface UploadThumbnailRequest {
  file: Buffer;
  filename: string;
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
  page: number;
  height?: number;
  width?: number;
}

export interface UpdateThumbnailRequest {
  _id: string;
  thumbnail_id: string;
  hasNewPage: boolean;
  newPage?: number;
}

export interface RawThumbnail {
  path: ParsedPath;
  width: number;
  height: number;
}

export interface UpdateThumbnailResponse {
  _id: any;
  thumbnail: Thumbnail | undefined;
}

export interface UploadParams {
  file: Buffer;
  key: string;
  permissions: string;
}

export interface UpdateRequest {
  sharetribe_user_id: string;
  sharetribe_listing_id: string;
  metadata: {
    [key: string]: {
      thumbnailSettings: {
        isThumbnail: boolean;
        page: number;
        thumbnail_id: string;
      };
    };
  };
}

export interface UploadResponse {
  [key: string]: {
    _id: string;
    thumbnail_id?: string;
  };
}
