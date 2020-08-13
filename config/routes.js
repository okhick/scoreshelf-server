const { ProcessUploadedMusic } = require('../services/uploads')

module.exports = function(app) {

  app.get("/test", (req, res) => {
    res.json("DOPE");
  });

  app.post("/musicUpload", (req, res) => {
    let recievedFiles = ProcessUploadedMusic(req.files);
    return res.json(recievedFiles);
  });

}