const { Upload } = require('../controllers/Upload');
const { S3 } = require('../controllers/S3');
const { deleteById } = require('../controllers/Delete')

module.exports = function(app) {

  app.get("/test", (req, res) => {
    res.json("DOPE");
  });

  app.post("/musicUpload", async (req, res) => {
    const receivedFiles = req.files;
    const receivedBody = req.body;
    const response = {};

    for (key in receivedFiles) {
      const upload = new Upload(receivedFiles[key], receivedBody);
      const databaseRes = await upload.saveNewAsset();
      response[databaseRes.mongo.asset_name] = {_id: databaseRes.mongo._id};
    }
    console.log(response);
    return res.json(response);
  });

  app.delete("/deleteAsset", async (req, res) => {
    const receivedBody = req.body;
    deleteById(receivedBody.id);
    
    return res.json(true);
  });

  app.get("/scoreshelf", async (req, res) => {
    const scoreshelfAssets = new S3;
    const buckets = await scoreshelfAssets.listBuckets();
    res.json(buckets);
  });


}