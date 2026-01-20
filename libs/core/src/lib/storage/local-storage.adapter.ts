import { Injectable } from '@nestjs/common';
import { StorageAdapter, FileData, UploadResult } from '@vertex/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir = 'uploads';

  constructor() {
    // Ensure directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: FileData): Promise<UploadResult> {
    // 1. Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.filename);
    const filename = `${uniqueSuffix}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // 2. Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);

    // 3. Return the URL (Assumes relative path proxying or static serving)
    return {
      url: `/uploads/${filename}`,
      key: filename
    };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}