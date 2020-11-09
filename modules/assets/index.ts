import { AssetDB } from './controllers/asset-db';
import { AssetProcessing } from './middleware/asset-processing';

import { Application, Request, Response } from 'express';
import { Asset, AssetDataRequest, UpdateThumbnailResponse } from './@types';

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

    const receivedBody: Asset[] = req.body.filesToRemove;
    const deletedFiles: String[] = await assetProcessing.deleteAssets(receivedBody);

    return res.json(deletedFiles);
  });

  app.post('/updateAssetMetadata', async (req: Request, res: Response) => {
    const assetDb = new AssetDB();
    const assetProcessing = new AssetProcessing();
    const request = req.body;
    // const response = {};

    // get all assets related to this listing
    let assetsToUpdate = <Asset[]>(
      await assetDb.getAssetDataByListing(request.sharetribe_listing_id)
    );

    // update the thumbnail
    const needThumbnailUpdate = await assetProcessing.checkForNewThumbnail(request, assetsToUpdate);
    if (needThumbnailUpdate) {
      const thumbnailUpdate = await assetProcessing.updateThumbnail(request, assetsToUpdate);
      // update assets and replace assetToUpdate with fresh data
      assetsToUpdate = await assetDb.updateThumbnailData(assetsToUpdate, thumbnailUpdate);
    }

    // ...do more updating here

    // return full list of assets for this listing for any updating needed
    return res.json(assetsToUpdate);
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
