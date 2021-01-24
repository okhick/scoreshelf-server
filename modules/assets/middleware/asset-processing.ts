import { AssetIO } from '../controllers/asset-io';
import { AssetDB } from '../controllers/asset-db';
import { Asset2Thumbnail } from './asset2thumbnail';
import { Sharp } from './sharp';

import { parse, format } from 'path';
import { unlinkSync, readFileSync } from 'fs';

import { Request } from 'express';
import { FileArray } from 'express-fileupload';
import {
  Asset,
  AssetMetadata,
  UploadRequest,
  UpdateRequest,
  UploadThumbnailRequest,
  UpdateThumbnailResponse,
  UploadResponse,
  Thumbnail,
  ProfilePicture,
  UploadProfilePictureRequest,
} from '../@types';
import { AssetModel, ThumbnailModel } from '../models/Asset';
import sharp from 'sharp';

export class AssetProcessing {
  // ==============================
  // ========== Uploaders =========
  // ==============================

  async uploadAssets(assets: FileArray, data: AssetMetadata) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const response: Asset[] = [];

    const assetKeys = Object.keys(assets);
    await Promise.all(
      assetKeys.map(async (assetKey) => {
        const upload: UploadRequest = {
          file: assets[assetKey],
          sharetribe_user_id: data.sharetribe_user_id,
          sharetribe_listing_id: data.sharetribe_listing_id,
        };

        const s3Res = await assetIo.saveAssetFile(upload);
        const assetDoc = await assetDb.saveAssetData(upload);
        response.push(assetDoc);
      })
    );

    return response;
  }

  async uploadProfilePicture(asset: FileArray, data: AssetMetadata) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();
    const sharp = new Sharp();

    // First check for existing profile pic and delete if it exists
    const currentProfilePic = (await assetDb.getProfilePictureDataByUser(
      data.sharetribe_user_id
    )) as ProfilePicture;
    if (currentProfilePic != null) {
      this.deleteProfilePicture(currentProfilePic);
    }

    // resize the image to a square
    const resizedPicture = await sharp.resizeProfilePicture(asset.file.data);
    asset.file.data = resizedPicture;

    // Then upload the new one.
    const upload: UploadProfilePictureRequest = {
      file: asset.file,
      sharetribe_user_id: data.sharetribe_user_id,
    };

    const s3Res = await assetIo.saveProfilePictureFile(upload);
    const assetDoc = await assetDb.saveProfilePictureData(upload);
    const response = assetDoc;

    return response;
  }

  // ========================================
  // ========== Thumbnail Processes =========
  // ========================================

  // Use to find out if there's any thumbnail work to be done
  async checkForNewThumbnail(newData: UpdateRequest, assetsToUpdate: Asset[]): Promise<boolean> {
    const metadata = newData.metadata;

    // There are no current thumbnails
    const gatherThumbnailSettings = assetsToUpdate.map((listing) => listing.thumbnail_settings);
    const thereAreNoThumbnails = gatherThumbnailSettings.every((listing) => listing == undefined);
    if (thereAreNoThumbnails) return true;

    // if old page matched new page nothing needs to be done
    const newThumbsNeeded = assetsToUpdate.map((asset) => {
      if (asset?.thumbnail_settings?.page === metadata[asset._id]?.thumbnailSettings.page) {
        return false;
      } else {
        return true;
      }
    });
    // if anything in the array is true, return true
    return newThumbsNeeded.some((currentValue) => currentValue);
  }

  // handles creation, updates, and deletion of thumbnails
  async updateThumbnail(
    updateRequest: UpdateRequest,
    assetsToUpdate: Asset[]
  ): Promise<UpdateThumbnailResponse[]> {
    const updateMetadata = updateRequest.metadata;

    // get the asset attached to this thumbnail
    // this will stay null if we're only deleting thumbs
    let assetIdForThumbnail: string | null = null;
    for (const asset in updateMetadata) {
      if (updateMetadata[asset].thumbnailSettings.page != null) {
        assetIdForThumbnail = asset;
      }
    }
    const assetForThumbnailFilter = assetsToUpdate.filter((asset) =>
      asset?._id.equals(assetIdForThumbnail)
    );
    const assetForThumbnail = assetForThumbnailFilter[0]; // There should only be one

    // delete all existing thumbnails for this listing
    assetsToUpdate.forEach(async (asset) => {
      if (asset.thumbnail_settings) {
        await this.deleteThumbnail(asset.thumbnail_settings._id);
      }
    });

    const res = [];

    // make the new thumbnail if there's one to make
    if (assetForThumbnail != null) {
      const formattedNewThumb = await this.processCreateThumbnail(assetForThumbnail, updateRequest);
      res.push(formattedNewThumb);
    }

    // make the responses for everything that doesn't have a thumbnail
    assetsToUpdate.forEach((asset) => {
      if (!asset?._id.equals(assetIdForThumbnail)) {
        const blankThumbnail = { _id: asset._id, thumbnail: undefined };
        res.push(blankThumbnail);
      }
    });

    return res;
  }

  // download the needed asset and manage the thumbnail creation
  async processCreateThumbnail(
    assetWithThumbnail: Asset,
    updateRequest: UpdateRequest
  ): Promise<UpdateThumbnailResponse> {
    const assetIo = new AssetIO();
    const updateMetadata = updateRequest.metadata;

    // download the asset
    const assetBufferForThumbnail = await assetIo.getAsset(assetWithThumbnail);

    // process the thumbnail
    const newThumbnailData = await this.createThumbnail({
      file: assetBufferForThumbnail,
      filename: assetWithThumbnail.asset_name,
      sharetribe_user_id: updateRequest.sharetribe_user_id,
      sharetribe_listing_id: updateRequest.sharetribe_listing_id,
      page: updateMetadata[assetWithThumbnail._id].thumbnailSettings.page,
    });

    // return the new thumbnail to updating with asset
    return { _id: assetWithThumbnail._id, thumbnail: newThumbnailData };
  }

  // create, upload, and save new thumbnail data
  async createThumbnail(upload: UploadThumbnailRequest): Promise<Thumbnail> {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();
    const asset2thumbnail = new Asset2Thumbnail();

    // create the new thumb by shelling out to Ghostscript or ImageMagik or something
    const rawThumbnail = await asset2thumbnail.makePdfThumbnail(
      upload.file,
      parse(upload.filename).name,
      upload.page
    );

    // upload the file and save the data
    const thumbUpload: UploadThumbnailRequest = {
      file: readFileSync(format(rawThumbnail.path)),
      filename: rawThumbnail.path.base,
      sharetribe_user_id: upload.sharetribe_user_id,
      sharetribe_listing_id: upload.sharetribe_listing_id,
      page: upload.page,
      height: rawThumbnail.height,
      width: rawThumbnail.width,
    };
    const s3Res = await assetIo.saveThumbnailFile(thumbUpload);
    const mongoRes = await assetDb.saveThumbnailData(thumbUpload);

    // delete the temp file
    unlinkSync(format(rawThumbnail.path));

    return mongoRes;
  }

  // ==============================
  // ========== Deleters ==========
  // ==============================

  async deleteAssets(assets: Asset[]) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const deletedFiles: String[] = [];
    await Promise.all(
      assets.map(async (file) => {
        // first delete the data but also get the document that was deleted
        const assetToBeDeleted = await assetDb.deleteAssetData(file._id, 'asset');
        // then delete that asset
        if (assetToBeDeleted) await assetIo.deleteFile(assetToBeDeleted);
        // if there was an asset, there might have been a thumbnail, check for it and delete
        if (assetToBeDeleted instanceof AssetModel && assetToBeDeleted.thumbnail_settings) {
          const thumbToDelete = await assetDb.deleteAssetData(
            assetToBeDeleted.thumbnail_settings._id,
            'thumbnail'
          );
          if (thumbToDelete) await assetIo.deleteFile(thumbToDelete);
        }
        deletedFiles.push(file._id);
      })
    );

    return deletedFiles;
  }

  async deleteThumbnail(thumbnail_id: string) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();
    const thumbnailDeleted = await assetDb.deleteAssetData(thumbnail_id, 'thumbnail');
    if (thumbnailDeleted) assetIo.deleteFile(thumbnailDeleted);

    return thumbnailDeleted;
  }

  async deleteProfilePicture(profilePicture: ProfilePicture) {
    const assetIo = new AssetIO();
    const assetDb = new AssetDB();

    const profilePictureDeleted = await assetDb.deleteAssetData(profilePicture._id, 'profile');
    if (profilePictureDeleted) assetIo.deleteFile(profilePictureDeleted);

    return profilePictureDeleted;
  }

  // async newThumbnail(asset: UploadThumbnailRequest) {
  //   const asset2thumbnail = new Asset2Thumbnail();

  //   const thumbnailFilePath = await asset2thumbnail.makePdfThumbnail(
  //     asset.file,
  //     parse(asset.filename).name,
  //     asset.page
  //   );

  //   return thumbnailFilePath;
  // }
}
