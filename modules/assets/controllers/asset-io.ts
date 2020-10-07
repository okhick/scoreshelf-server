const S3 = require('../middleware/s3.js');

export class AssetIO {
  async saveAssetFile(upload) {
    const s3 = new S3();
    const uploadPath = `${upload.user_id}/${upload.listing_id}`;
    const upload_res = await s3.uploadFile(upload.file.data, `${uploadPath}/${upload.file.name}`);
    return upload_res; 
  }
  async getAssetLink(asset) {
    const s3 = new S3();
    const assetLink = await s3.getSignedUrl(asset);
    return assetLink;
  }

  async deleteAssetFile(name) {
    const s3 = new S3();
    let res = await s3.removeFile(name);
    return res;
  }
}
