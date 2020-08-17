const Asset = require('../models/Asset');
const { S3 } = require('../controllers/S3');

class Upload {
  constructor(file, body) {
    this.upload = file;
    this.user_id = body.sharetribe_user_id;
  }
  
  async saveNewAsset() {
    const res = {}
    res.mongo = await this.saveNewAssetData();
    res.s3 = await this.saveAssetFile();
    return res
  }

  async saveNewAssetData() {
    const newAsset = new Asset({
      sharetribe_user_id: this.user_id,
      asset_name: this.upload.name,
      size: this.upload.size,
    });
    const newAssetRes = await newAsset.save();
    return newAssetRes;
  }

  async saveAssetFile() {
    const s3 = new S3();
    const upload_res = await s3.uploadFile(this.upload.data, this.upload.name);
    return upload_res;
  }
}

module.exports = { Upload };