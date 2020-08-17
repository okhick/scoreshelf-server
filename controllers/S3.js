const S3_SDK = require('aws-sdk/clients/s3');

class S3 {
  connectToStorage() {
    const instance = new S3_SDK({
      accessKeyId: 'minio' ,
      secretAccessKey: 'minio123' ,
      endpoint: 'http://127.0.0.1:9000' ,
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
      Bucket: 'scoreshelf', 
      Key: fileName, 
      Body: file 
    };

    const res_upload = await s3.upload (uploadParams).promise();
    return res_upload;
  }
}

module.exports = { S3 };