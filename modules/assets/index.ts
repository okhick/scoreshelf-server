import { AssetIO } from './controllers/asset-io';
import { AssetDB } from './controllers/asset-db';

import { Application, Request, Response } from "express";
import { AssetDataRequest, DeleteAssetRequest, UploadRequest, UploadResponse } from './types';

module.exports = function(app: Application) {

  app.post("/uploadAsset", async (req: Request, res: Response) => {
    const assetIo = new AssetIO;
    const assetDb = new AssetDB;

    const receivedFiles = req.files;
    const receivedBody = req.body;
    const response: UploadResponse = {};
    
    for (const key in receivedFiles) {
      const upload: UploadRequest = {
        file: receivedFiles[key], 
        sharetribe_user_id: receivedBody.sharetribe_user_id,
        sharetribe_listing_id: receivedBody.sharetribe_listing_id
      };
      
      await assetIo.saveAssetFile(upload);
      const mongoRes = await assetDb.saveAssetData(upload);
      response[mongoRes.asset_name] = {_id: mongoRes._id};
    }
    console.log(response)
    return res.json(response);
  });
  
  app.delete("/deleteAsset", async (req: Request, res: Response) => {
    const assetIo = new AssetIO;
    const assetDb = new AssetDB;

    const receivedBody: DeleteAssetRequest = req.body;
    Promise.all(
      receivedBody.filesToRemove.map(async (file) => {
        await assetDb.deleteAssetData(file._id);
        await assetIo.deleteAssetFile(`${file.sharetribe_user_id}/${file.sharetribe_listing_id}/${file.asset_name}`)
      })
    );
    
    return res.json(true);
  });

  app.post("/getAssetData", async (req: Request, res: Response) => {
    const assetDb = new AssetDB;

    const receivedBody = req.body;
    const dataRequest: AssetDataRequest = {
      ids: receivedBody.ids,
      getLink: receivedBody.get_link
    }

    let assetData = await assetDb.getAssetData(dataRequest);
    res.json(assetData);
  })
  
  // TESTS
  app.get("/test", (req: Request, res: Response) => {
    res.json("ASSET MODULE");
  });

}