import { ManagedUpload } from 'aws-sdk/clients/s3';
import { S3 } from '../middleware/s3';
import { Asset, Thumbnail, UploadRequest, UploadThumbnailRequest } from '../@types';
import { AssetModel, ThumbnailModel } from '../models/Asset';

export class AssetIO {
  ASSET_BASE = 'assets';
  GENERATED_BASE = 'generated';
  THUMBNAIL_PREFIX = 'thumb';

  async saveAssetFile(upload: UploadRequest): Promise<ManagedUpload.SendData> {
    const s3 = new S3();
    const uploadPath = `${this.ASSET_BASE}/${upload.sharetribe_user_id}/${upload.sharetribe_listing_id}`;
    const uploadParams = {
      file: upload.file.data,
      permissions: 'private',
      key: `${uploadPath}/${upload.file.name}`,
    };

    const upload_res = await s3.uploadFile(uploadParams);

    return upload_res;
  }

  async saveThumbnailFile(upload: UploadThumbnailRequest): Promise<ManagedUpload.SendData> {
    const s3 = new S3();
    const uploadPath = `${this.GENERATED_BASE}/${upload.sharetribe_user_id}/${upload.sharetribe_listing_id}`;
    const uploadParams = {
      file: upload.file,
      permissions: 'public-read',
      key: `${uploadPath}/${this.THUMBNAIL_PREFIX}.${upload.filename}`,
    };

    const upload_res = await s3.uploadFile(uploadParams);

    return upload_res;
  }

  async deleteAssetFile(file: Asset | Thumbnail) {
    const s3 = new S3();

    let res;
    if (file instanceof AssetModel) {
      const key = `${this.ASSET_BASE}/${file.sharetribe_user_id}/${file.sharetribe_listing_id}/${file.asset_name}`;
      res = await s3.removeFile(key);
    }
    if (file instanceof ThumbnailModel) {
      const key = `${this.GENERATED_BASE}/${file.sharetribe_user_id}/${file.sharetribe_listing_id}/${file.asset_name}`;
      res = await s3.removeFile(key);
    }
    return res;
  }

  getSignedUrl(assetData: Asset): string {
    const s3 = new S3();
    const key = `${this.ASSET_BASE}/${assetData.sharetribe_user_id}/${assetData.sharetribe_listing_id}/${assetData.asset_name}`;
    const link = s3.getSignedUrl(key);
    return link;
  }
}
