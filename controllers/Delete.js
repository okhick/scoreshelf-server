const Asset = require('../models/Asset');
const { S3 } = require('../controllers/S3');

class Delete {

  async deleteAsset(fileData) {
    let res = {};
    res.mongo = await this.deleteAssetData(fileData.scoreshelf_id);
    const assetPath = `${res.mongo.sharetribe_user_id}/${res.mongo.sharetribe_listing_id}/${res.mongo.asset_name}`;
    res.s3 = await this.deleteAssetFile(assetPath);
    return res;
  }

  async deleteAssetData(id) {
    let res = await Asset.findOneAndDelete({_id: id});
    return res;
  }

  async deleteAssetFile(name) {
    const s3 = new S3();
    let res = await s3.removeFile(name);
    return res;
  }
}


module.exports = { Delete };