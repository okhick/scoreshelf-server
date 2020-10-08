import { S3 } from '../middleware/s3';
import { Asset, UploadRequest } from '../types';

export class AssetIO {
  async saveAssetFile(upload: UploadRequest): Promise<any> {
    const s3 = new S3();
    const uploadPath = `${upload.sharetribe_user_id}/${upload.sharetribe_listing_id}`;
    const upload_res = await s3.uploadFile(upload.file.data, `${uploadPath}/${upload.file.name}`);
    return upload_res; 
  }

  async deleteAssetFile(name: string) {
    const s3 = new S3();
    let res = await s3.removeFile(name);
    return res;
  }
}
