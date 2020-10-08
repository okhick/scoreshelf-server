import { UploadedFile } from 'express-fileupload';
import { Document } from 'mongoose';

// Extend the Mongoose document with Assest things
export interface Asset extends Document {
  sharetribe_user_id: string,
  sharetribe_listing_id: string,
  asset_name: string,
  size: number,
  date_added: Date,
}
export interface AssetDataRequest {
  ids: [{ scoreshelf_id: string }],
  getLink: boolean
}
export interface HydratedAsset extends Asset {
  link: string
}
export interface UploadRequest {
  file: UploadedFile, // this is the file blob which doesn't exist in node?
  sharetribe_user_id: string,
  sharetribe_listing_id: string;
}

export interface UploadResponse {
  [key: string]: { _id: string }
}