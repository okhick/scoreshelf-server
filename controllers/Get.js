const Asset = require('../models/Asset');
const { S3 } = require('./S3');

class Get {
  async getAssetData(ids, getLink) {
    return Promise.all(ids.map(async (id) => {
      const assetData = await Asset.findById(id.scoreshelf_id);
      if (getLink) { 
        const link = await this.getAssetLink(assetData);
        assetData._doc.link = link;
      }
      return assetData;
    }));
  }

  async getAssetLink(asset) {
    const s3 = new S3();
    const assetLink = await s3.getSignedUrl(asset);
    return assetLink;
  }
}

module.exports = { Get } 