const Asset = require('../models/Asset');
const { S3 } = require('../controllers/S3');

class Delete {
  constructor(body) {
    this.user_id = body.sharetribe_user_id;
    this.listing_id = body.sharetribe_listing_id;
  }

  async deleteAsset(fileData) {
    let res = {};
    let assetData = await this.getAssetData(fileData);
    res.mongo = await this.deleteAssetData(fileData.scoreshelf_id);
    const assetPath = `${assetData.sharetribe_user_id}/${assetData.sharetribe_listing_id}/${fileData.name}`;
    res.s3 = await this.deleteAssetFile(assetPath);
    return res;
  }

  async getAssetData(fileData) {
    let res = await Asset.findOne({
      sharetribe_user_id: this.user_id,
      sharetribe_listing_id: this.listing_id,
      asset_name: fileData.name
    });
    return res;
  }

  async deleteAssetData(id) {
    let res = await Asset.deleteOne({_id: id});
    return;
  }

  async deleteAssetFile(name) {
    const s3 = new S3();
    let res = await s3.removeFile(name);
    return res;
  }
}


module.exports = { Delete };