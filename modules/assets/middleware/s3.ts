import S3_SDK from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/lib/core';

import { UploadParams } from '../@types';
import { PromiseResult } from 'aws-sdk/lib/request';

export class S3 {
  bucket = 'scoreshelf';

  connectToStorage(): S3_SDK {
    const instance = new S3_SDK({
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
      secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
      endpoint: process.env.DO_SPACES_ENDPOINT,
    });

    return instance;
  }

  async listBuckets(): Promise<PromiseResult<S3_SDK.ListBucketsOutput, AWSError>> {
    const s3 = this.connectToStorage();
    const buckets = await s3.listBuckets().promise();
    return buckets;
  }

  async uploadFile(params: UploadParams): Promise<S3_SDK.ManagedUpload.SendData> {
    const s3 = this.connectToStorage();
    const uploadParams = {
      Bucket: this.bucket,
      Key: params.key,
      Body: params.file,
      ACL: params.permissions,
    };

    const res_upload = await s3.upload(uploadParams).promise();
    return res_upload;
  }

  async removeFile(fileName: string): Promise<PromiseResult<S3_SDK.DeleteObjectOutput, AWSError>> {
    const s3 = this.connectToStorage();
    const deleteParams = {
      Bucket: this.bucket,
      Key: fileName,
    };

    const res_delete = await s3.deleteObject(deleteParams).promise();
    return res_delete;
  }

  getSignedUrl(key: string): string {
    const s3 = this.connectToStorage();

    const params = {
      Bucket: this.bucket,
      Key: key,
    };
    const link = s3.getSignedUrl('getObject', params);
    return link;
  }

  async getObject(key: string): Promise<S3_SDK.GetObjectOutput | undefined> {
    const s3 = this.connectToStorage();

    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };
      const object = await s3.getObject(params).promise();
      return object;
    } catch (e) {
      console.log('Could not download asset', e);
    }
  }
}
