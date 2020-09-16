const Asset = require('../models/Asset');
const { S3 } = require('../controllers/S3');

class Delete {

  async deleteAsset(fileData) {
    let res = {};
    res.mongo = await this.deleteAssetData(fileData.scoreshelf_id);
    res.s3 = await this.deleteAssetFile(fileData.name);
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