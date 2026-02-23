import { Injectable, Inject } from '@nestjs/common';
import { StorageAdapter, FileData, UploadResult } from '@vertex-cms/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';

export interface GcsCredentials {
  client_email: string;
  private_key: string;
}

export interface GcsStorageOptions {
  bucketName: string;
  projectId?: string;
  keyFilename?: string; // Path to JSON key file
  credentials?: GcsCredentials; // Direct credentials (e.g. from ENV)
  publicUrl?: string; // Optional custom public URL (e.g. CDN)
}

@Injectable()
export class GcsStorageAdapter implements StorageAdapter {
  private storage: Storage;
  private bucketName: string;

  constructor(@Inject('GCS_STORAGE_OPTIONS') private options: GcsStorageOptions) {
    this.storage = new Storage({
      projectId: options.projectId,
      keyFilename: options.keyFilename,
      credentials: options.credentials,
    });
    this.bucketName = options.bucketName;
  }

  async upload(file: FileData): Promise<UploadResult> {
    const bucket = this.storage.bucket(this.bucketName);
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.filename);
    const filename = `${uniqueSuffix}${ext}`;
    
    const gcsFile = bucket.file(filename);

    await gcsFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    // Make public if needed, or assume bucket policy handles it.
    // For now, we return the standard GCS public URL format
    const publicUrl = this.options.publicUrl 
      ? `${this.options.publicUrl}/${filename}`
      : `https://storage.googleapis.com/${this.bucketName}/${filename}`;

    return {
      url: publicUrl,
      key: filename,
    };
  }

  async delete(key: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(key);
    
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
  }
}
