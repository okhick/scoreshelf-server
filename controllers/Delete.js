const Asset = require('../models/Asset');
const { S3 } = require('../controllers/S3');

class Delete {

  async deleteAsset(fileData) {
    await Promise.all([
      this.deleteAssetData(fileData._id),
      this.deleteAssetFile(`${fileData.sharetribe_user_id}/${fileData.sharetribe_listing_id}/${fileData.asset_name}`)
    ]);
    return true;
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