import { AssetDB } from './controllers/asset-db';
import { AssetProcessing } from './middleware/asset-processing';

import { Application, Request, Response } from 'express';
import { AssetDataRequest, DeleteAssetRequest } from './@types';

module.exports = function (app: Application) {
  app.post('/uploadAssets', async (req: Request, res: Response) => {
    const assetProcessing = new AssetProcessing();

    const receivedFiles = req.files;
    const receivedBody = JSON.parse(req.body.assetMetadata);

    const response = await assetProcessing.uploadAssets(receivedFiles, receivedBody);

    return res.json(response);
  });

  app.delete('/deleteAssets', async (req: Request, res: Response) => {
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
      ids: receivedBody.scoreshelf_ids,
      getLink: receivedBody.get_link,
      getType: 'asset',
    };

    let assetData = await assetDb.getAssetData(dataRequest);
    res.json(assetData);
  });

  // app.get('/testpdfparse', async (req: Request, res: Response) => {
  //   const assetProcessing = new Asset2Thumbnail();

  //   const pageToConvertAsImage = 5;
  //   // const PDF = readFileSync('./brickwall.pdf');
  //   const PDF = readFileSync('./Scott Wollschleger - AMERICAN DREAM_8.4.17 (do not duplicate).pdf');
  //   const thumbnailFilePath = await assetProcessing.makePdfThumbnail(
  //     PDF,
  //     'Scott Wollschleger - AMERICAN DREAM_8.4.17 (do not duplicate).pdf',
  //     pageToConvertAsImage
  //   );

  //   res.json(thumbnailFilePath);
  // });

  // TESTS
  app.get('/test', (req: Request, res: Response) => {
    res.json('ASSET MODULE');
  });
};
