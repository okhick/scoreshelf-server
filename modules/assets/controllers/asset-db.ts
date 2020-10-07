const Asset = require('../models/Asset.js');
const S3 = require('../middleware/s3.js');


export class AssetDB {
  async saveAssetData(upload) {
    const newAsset = new Asset({
      sharetribe_user_id: upload.user_id,
      sharetribe_listing_id: upload.listing_id,
      asset_name: upload.file.name,
      size: upload.file.size,
    });
    const newAssetRes = await newAsset.save();
    return newAssetRes;
  }

  async getAssetData(ids, getLink) {
    return Promise.all(ids.map(async (id) => {
      const assetData = await Asset.findById(id.scoreshelf_id);
      if (getLink) { 
        const s3 = new S3();
        const link = await s3.getSignedUrl(assetData);
        assetData._doc.link = link;
      }
      return assetData;
    }));
  }

  async deleteAssetData(id) {
    let res = await Asset.findOneAndDelete({_id: id});
    return res;
  }
}