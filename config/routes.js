const { Upload } = require('../controllers/Upload');
const { Delete } = require('../controllers/Delete')
const { S3 } = require('../controllers/S3');
const { Get } = require('../controllers/Get'); 

module.exports = function(app) {

  app.post("/uploadAsset", async (req, res) => {
    const receivedFiles = req.files;
    const receivedBody = req.body;
    const response = {};
    
    for (key in receivedFiles) {
      const upload = new Upload(receivedFiles[key], receivedBody);
      const databaseRes = await upload.saveNewAsset();
      response[databaseRes.mongo.asset_name] = {_id: databaseRes.mongo._id};
    }
    console.log(response)
    return res.json(response);
  });
  
  app.delete("/deleteAsset", async (req, res) => {
    const receivedBody = req.body;
    Promise.all(
      res.delete = receivedBody.filesToRemove.map(async (file) => {
        const del = new Delete();
        const deleteRes = await del.deleteAsset(file);
      })
    );
    
    return res.json(true);
  });

  app.post("/getAssetData", async (req, res) => {
    const receivedBody = req.body;
    const assetIds = receivedBody.ids;
    const getLink = receivedBody.get_link; 
    const get = new Get();

    let assetData = await get.getAssetData(assetIds, getLink);
    res.json(assetData);
  })
  
  // TESTS
  app.get("/test", (req, res) => {
    res.json("DOPE");
  });
  app.get("/scoreshelf", async (req, res) => {
    const scoreshelfAssets = new S3;
    const buckets = await scoreshelfAssets.listBuckets();
    res.json(buckets);
  });


}