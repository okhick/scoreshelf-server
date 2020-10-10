import { AssetIO } from './controllers/asset-io';
import { AssetDB } from './controllers/asset-db';

import PDFParser from "pdf2json";
import { fromBase64 } from "pdf2pic";
import { readFileSync } from "fs";

import { Application, Request, Response } from "express";
import { AssetDataRequest, DeleteAssetRequest, UploadRequest, UploadResponse } from './@types';




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
      scoreshelf_ids: receivedBody.scoreshelf_ids,
      getLink: receivedBody.get_link
    }

    let assetData = await assetDb.getAssetData(dataRequest);
    res.json(assetData);
  });

  app.get("/testpdfparse", async (req: Request, res: Response) => {
    const PDF = readFileSync('/var/server/brickwall.pdf');
    const pdfData = await getPdfJSON(PDF);
    return res.json(pdfData);
  })
  
  // TESTS
  app.get("/test", (req: Request, res: Response) => {
    res.json("ASSET MODULE");
  });

}

function getPdfJSON(pdf: Buffer) {
  const pdfParser = new PDFParser();
  return new Promise((resolve, reject) => {
    // why do i have to assign these to use them in the listeners
    const res = resolve;
    const rej = reject;
    
    // not sure why they made these listeners not just promises...
    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      resolve(pdfData);
    });
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(errData);
    });
    pdfParser.parseBuffer(pdf);
  });
}