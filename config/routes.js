const { Upload } = require('../services/Upload');

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
      response[databaseRes.asset_name] = {_id: databaseRes._id};
    }
  
    return res.json(response);
  });

}