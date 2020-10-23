import { AssetDB } from './controllers/asset-db';
import { AssetProcessing } from './middleware/asset-processing';

import { readFileSync, statSync, rmdirSync } from 'fs';

import { Application, Request, Response } from 'express';
import { AssetDataRequest, DeleteAssetRequest } from './@types';

module.exports = function (app: Application) {
  app.post('/uploadAsset', async (req: Request, res: Response) => {
    const assetProcessing = new AssetProcessing();

    const receivedFiles = req.files;
    const receivedBody = JSON.parse(req.body.assetMetadata);

    const response = await assetProcessing.uploadAssets(receivedFiles, receivedBody);

    return res.json(response);
  });

  app.delete('/deleteAsset', async (req: Request, res: Response) => {
    const assetProcessing = new AssetProcessing();

    const receivedBody: DeleteAssetRequest = req.body;
    const deletedFiles: String[] = await assetProcessing.deleteAssets(receivedBody);

    return res.json(deletedFiles);
  });

  app.post('/updateAssetMetadata', async (req: Request, res: Response) => {
    const assetDb = new AssetDB();

    const updateRes = await assetDb.updateAssetData(req.body);
    return res.json(updateRes);
  });

  app.post('/getAssetData', async (req: Request, res: Response) => {
    const assetDb = new AssetDB();

    const receivedBody = req.body;
    const dataRequest: AssetDataRequest = {
      scoreshelf_ids: receivedBody.scoreshelf_ids,
      getLink: receivedBody.get_link,
    };

    let assetData = await assetDb.getAssetData(dataRequest);
    res.json(assetData);
  });

  // app.get("/testpdfparse", async (req: Request, res: Response) => {
  //   const assetProcessing = new AssetProcessing;

  //   const pageToConvertAsImage = 1;
  //   const PDF = readFileSync('/var/server/brickwall.pdf');
  //   const thumbnailFilePath = await assetProcessing.makePdfThumbnail(PDF, pageToConvertAsImage);

  //   res.json(thumbnailFilePath);
  // })

  // TESTS
  app.get('/test', (req: Request, res: Response) => {
    res.json('ASSET MODULE');
  });
};
