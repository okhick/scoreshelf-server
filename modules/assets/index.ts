import { AssetIO } from './controllers/asset-io';
import { AssetDB } from './controllers/asset-db';

import PDFParser from "pdf2json";
import { fromBase64 } from "pdf2pic";
import { readFileSync, mkdirSync, rmdirSync, fstat } from "fs";

import { Application, Request, Response } from "express";
import { AssetDataRequest, DeleteAssetRequest, UploadRequest, UploadResponse } from './@types';
import { PDFJson } from 'pdf2json/typings';

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
    const pageToConvertAsImage = 1;
    const PDF = readFileSync('/var/server/Vue.js Cheat Sheet.pdf');
    const pdfJSON = await getPdfJSON(PDF);
    const pdfData = getPdfDimensions(pdfJSON, pageToConvertAsImage);

    const imgDimensions = setImageDimensions(pdfData.ratio);

    const imageOptions = {
      density: 300,
      saveFilename: pdfJSON.formImage.Agency,
      savePath: "./temp",
      format: "png",
      width: imgDimensions.width,
      height: imgDimensions.height,
    };

    // for some reason it was giving me greif about just a normal buffer
    const base = PDF.toString('base64');
    const convertToImage = fromBase64(base, imageOptions);

    mkdirSync("./temp");
    await convertToImage(pageToConvertAsImage);
    res.sendFile(`/var/server/temp/${pdfJSON.formImage.Agency}.${pageToConvertAsImage}.png`);
    res.on('finish', () => rmdirSync("./temp",{recursive:true}));
  })
  
  // TESTS
  app.get("/test", (req: Request, res: Response) => {
    res.json("ASSET MODULE");
  });

}

function getPdfJSON(pdf: Buffer): Promise<PDFJson> {
  const pdfParser = new PDFParser();
  return new Promise((resolve, reject) => {
    // why do i have to assign these to use them in the listeners
    const res = resolve;
    const rej = reject;
    
    // not sure why they made these listeners not just promises...
    pdfParser.on("pdfParser_dataReady", (pdfData: PDFJson) => {
      resolve(pdfData);
    });
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(errData);
    });
    pdfParser.parseBuffer(pdf);
  });
}

function getPdfDimensions(pdfJSON: PDFJson, pageIndex: number): 
  { width: number, height: number, ratio: number } {
  // Page unit equals (96px/inch * 1inch / 4) = 24px/inch. See pdf2json/lib/pdfunit.js
  const pixelsPerInch = 24;

  const width = pdfJSON.formImage.Width * pixelsPerInch;
  const height = pdfJSON.formImage.Pages[pageIndex].Height * pixelsPerInch;
  const ratio = width / height;
  return { width, height, ratio }
}

function setImageDimensions(ratio: number): 
  { width: number, height: number } {
  const longSide = 900;
  let height = longSide;
  let width = height * ratio;

  // if this is true, it's landscape and we need scale to width = 900
  if (ratio > 1) {
    const mul = longSide / width;
    width = width * mul;
    height = height * mul;
  }
  return { width, height }
}
