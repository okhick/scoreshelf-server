import { AssetDB } from './controllers/asset-db';
import { AssetProcessing } from './middleware/asset-processing';

import { Router, Request, Response } from 'express';
import { Asset, AssetMetadata, AssetDataRequest } from './@types';
import { AssetIO } from './controllers/asset-io';

import { verifyToken } from '../auth/middleware/verifyToken';

const router = Router();

router.get('/test', (req: Request, res: Response) => res.json('ASSETS'));

router.post('/uploadAssets', verifyToken, async (req: Request, res: Response) => {
  const assetProcessing = new AssetProcessing();

  const receivedFiles = req.files;
  const receivedBody = JSON.parse(req.body.assetMetadata);

  const response = receivedFiles
    ? await assetProcessing.uploadAssets(receivedFiles, receivedBody)
    : 'no files sent';

  return res.json(response);
});

router.delete('/deleteAssets', verifyToken, async (req: Request, res: Response) => {
  const assetProcessing = new AssetProcessing();

  const receivedBody: Asset[] = req.body.filesToRemove;
  const deletedFiles: String[] = await assetProcessing.deleteAssets(receivedBody);

  return res.json(deletedFiles);
});

router.post('/updateAssetMetadata', verifyToken, async (req: Request, res: Response) => {
  const assetDb = new AssetDB();
  const assetProcessing = new AssetProcessing();
  const request = req.body;
  // const response = {};

  // get all assets related to this listing
  let assetsToUpdate = <Asset[]>await assetDb.getAssetDataByListing(request.sharetribe_listing_id);
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

router.get('/getAssetData', verifyToken, async (req: Request, res: Response) => {
  const assetDb = new AssetDB();
  const receivedBody = req.query;

  const dataRequest: AssetDataRequest = {
    ids: <string[]>receivedBody.scoreshelf_ids,
    getLink: JSON.parse(<string>receivedBody.getLink), //convert 'true' to boolean
    getType: <'asset' | 'thumbnail' | 'profile'>receivedBody.getType,
  };

  const assetData = await assetDb.getAssetData(dataRequest);
  res.json(assetData);
});

router.get('/getAssetBin', verifyToken, async (req: Request, res: Response) => {
  const assetDb = new AssetDB();
  const assetIo = new AssetIO();

  const scoreshelf_id = <string>req.query.scoreshelf_id;

  const dataRequest: AssetDataRequest = {
    ids: [scoreshelf_id],
    getLink: false,
    getType: 'asset',
  };
  const assetData = <Asset[]>await assetDb.getAssetData(dataRequest);
  const assetBuffer = await assetIo.getAsset(assetData[0]);

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
  });
  res.end(assetBuffer, 'binary');
});

router.get('/getThumbnailData', verifyToken, async (req: Request, res: Response) => {
  const assetDb = new AssetDB();

  const scoreshelf_ids = <string[]>req.query.scoreshelf_ids;
  const dataRequest: AssetDataRequest = {
    ids: scoreshelf_ids,
    getLink: false,
    getType: 'thumbnail',
  };
  const thumbnailData = await assetDb.getAssetData(dataRequest);
  res.json(thumbnailData);
});

router.post('/uploadProfilePicture', verifyToken, async (req: Request, res: Response) => {
  const assetProcessing = new AssetProcessing();

  const receivedFiles = req.files;
  const receivedBody: AssetMetadata = JSON.parse(req.body.assetMetadata);

  const response =
    receivedFiles != undefined
      ? await assetProcessing.uploadProfilePicture(receivedFiles, receivedBody)
      : 'no file attached';

  return res.json(response);
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

export default router;
