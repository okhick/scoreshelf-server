import { AssetIO } from './controllers/asset-io';
import { AssetDB } from './controllers/asset-db';

import { Application, Request, Response } from "express";
import { UploadedFile } from 'express-fileupload';

interface UploadRequest {
  file: UploadedFile, // this is the file blob which doesn't exist in node?
  user_id: string,
  listing_id: string;
}

interface UploadResponse {
  [key: string]: { _id: string }
}

interface AssetDataRequest {
  ids: string[],
  get_link: boolean
}

interface FileToRemove {
  _id: string,
  sharetribe_user_id: string,
  sharetribe_listing_id: string,
  asset_name: string
}

interface DeleteAssetRequest {
  filesToRemove: FileToRemove[]
}

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
        user_id: receivedBody.sharetribe_user_id,
        listing_id: receivedBody.sharetribe_listing_id
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
      receivedBody.filesToRemove.map(async (file: FileToRemove) => {
        await assetDb.deleteAssetData(file._id);
        await assetIo.deleteAssetFile(`${file.sharetribe_user_id}/${file.sharetribe_listing_id}/${file.asset_name}`)
      })
    );
    
    return res.json(true);
  });

  app.post("/getAssetData", async (req: Request, res: Response) => {
    const assetDb = new AssetDB;

    const receivedBody: AssetDataRequest = req.body;
    const assetIds = receivedBody.ids;
    const getLink = receivedBody.get_link; 

    let assetData = await assetDb.getAssetData(assetIds, getLink);
    res.json(assetData);
  })
  
  // TESTS
  app.get("/test", (req: Request, res: Response) => {
    res.json("DOPE");
  });

}