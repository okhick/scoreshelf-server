import S3_SDK from 'aws-sdk/clients/s3';
import { Asset } from '../types';
import { UploadedFile } from 'express-fileupload';

export class S3 {
  bucket = 'scoreshelf';

  connectToStorage() {
    const instance = new S3_SDK({
      accessKeyId: 'minio' ,
      secretAccessKey: 'minio123' ,
      endpoint: 'http://s3:9000' ,
      s3ForcePathStyle: true, // needed with minio?
    });

    return instance;
  }

  async listBuckets() {
    const s3 = this.connectToStorage();
    const buckets = await s3.listBuckets().promise();
    return buckets;
  }

  async uploadFile(file: UploadedFile["data"], fileName: string) {
    const s3 = this.connectToStorage();
    const uploadParams = { 
      Bucket: this.bucket, 
      Key: fileName, 
      Body: file 
    };

    const res_upload = await s3.upload (uploadParams).promise();
    return res_upload;
  }

  async removeFile(fileName: string) {
    const s3 = this.connectToStorage();
    const deleteParams = {
      Bucket: this.bucket,
      Key: fileName
    };

    const res_delete = await s3.deleteObject(deleteParams).promise();
    return res_delete;
  }

  getSignedUrl(asset: Asset) {
    const s3 = this.connectToStorage();
    const params = {
      Bucket: this.bucket, 
      Key: `${asset.sharetribe_user_id}/${asset.sharetribe_listing_id}/${asset.asset_name}`
    };
    const link = s3.getSignedUrl('getObject', params);
    return link;
  }
}