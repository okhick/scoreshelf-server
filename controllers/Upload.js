const Asset = require('../models/Asset');

class Upload {
  constructor(file, body) {
    this.upload = file;
    this.user_id = body.sharetribe_user_id;
  }
  
  async saveNewAsset() {
    const res = await this.saveNewAssetData();
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
}

module.exports = { Upload };