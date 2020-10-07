const { Upload } = require('../controllers/Upload');
const { Delete } = require('../controllers/Delete')
const { S3 } = require('../controllers/S3');
const { Get } = require('../controllers/Get'); 

import { Application, Request, Response } from "express";

interface UploadResponse {
  [key: string]: { _id: string }
}

interface AssetDataRequest {
  ids: string[],
  get_link: boolean
}

module.exports = function(app: Application) {

  app.post("/uploadAsset", async (req: Request, res: Response) => {
    const receivedFiles = req.files;
    const receivedBody = req.body;
    const response: UploadResponse = {};
    
    for (const key in receivedFiles) {
      const upload = new Upload(receivedFiles[key], receivedBody);
      const databaseRes = await upload.saveNewAsset();
      response[databaseRes.mongo.asset_name] = {_id: databaseRes.mongo._id};
    }
    console.log(response)
    return res.json(response);
  });
  
  app.delete("/deleteAsset", async (req: Request, res: Response) => {
    const receivedBody = req.body;
    Promise.all(
      res.send = receivedBody.filesToRemove.map(async (file: string) => {
        const del = new Delete();
        const deleteRes = await del.deleteAsset(file);
      })
    );
    
    return res.json(true);
  });

  app.post("/getAssetData", async (req: Request, res: Response) => {
    const receivedBody: AssetDataRequest = req.body;
    const assetIds = receivedBody.ids;
    const getLink = receivedBody.get_link; 
    const get = new Get();

    let assetData = await get.getAssetData(assetIds, getLink);
    res.json(assetData);
  })
  
  // TESTS
  app.get("/test", (req: Request, res: Response) => {
    res.json("DOPE");
  });
  app.get("/scoreshelf", async (req: Request, res: Response) => {
    const scoreshelfAssets = new S3;
    const buckets = await scoreshelfAssets.listBuckets();
    res.json(buckets);
  });


}