// libs/plugin-s3/src/s3.adapter.ts
import { StorageAdapter, FileData } from '@vertex/common';
// import { S3 } from '@aws-sdk/client-s3';

export class S3Adapter implements StorageAdapter {
//   private s3 = new S3({ ... });

  async upload(file: FileData) {
    // await this.s3.putObject({ 
    //   Bucket: 'my-bucket', 
    //   Key: file.filename, 
    //   Body: file.buffer 
    // });

    return { url: `https://my-bucket.s3.amazonaws.com/${file.filename}` };
  }
  
  async delete(key: string) { /* ... */ }
}