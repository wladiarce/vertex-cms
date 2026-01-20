export interface FileData {
  filename: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface UploadResult {
  url: string; // The public URL to access the file
  key?: string; // The internal ID/Path (e.g. S3 Key)
}

export abstract class StorageAdapter {
  abstract upload(file: FileData): Promise<UploadResult>;
  abstract delete(key: string): Promise<void>;
}