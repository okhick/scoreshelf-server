const S3_SDK = require('aws-sdk/clients/s3');

class S3 {
  constructor() {
    this.bucket = 'scoreshelf';
  }
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

  async uploadFile(file, fileName) {
    const s3 = this.connectToStorage();
    const uploadParams = { 
      Bucket: this.bucket, 
      Key: fileName, 
      Body: file 
    };

    const res_upload = await s3.upload (uploadParams).promise();
    return res_upload;
  }

  async removeFile(fileName) {
    const s3 = this.connectToStorage();
    const deleteParams = {
      Bucket: this.bucket,
      Key: fileName
    };

    const res_delete = await s3.deleteObject(deleteParams).promise();
    return res_delete;
  }
}

module.exports = { S3 };