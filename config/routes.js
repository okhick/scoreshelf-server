const { Upload } = require('../controllers/Upload');
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
      response[databaseRes.asset_name] = {_id: databaseRes._id};
    }
  
    return res.json(response);
  });

  app.delete("/deleteAsset", async (req, res) => {
    const receivedBody = req.body;
    deleteById(receivedBody.id);
    
    return res.json(true);
  })

}