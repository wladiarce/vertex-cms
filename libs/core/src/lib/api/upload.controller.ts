import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageAdapter } from '@vertex/common';


@Controller('api/vertex/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  
  constructor(private storage: StorageAdapter) {} // Inject the abstraction

  @Post()
  // No 'storage' option = Multer keeps file in Memory (Buffer)
  @UseInterceptors(FileInterceptor('file')) 
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  async uploadFile(@UploadedFile() file: any) {
    console.log('UPLOADING');

    // Delegate to the adapter
    const result = await this.storage.upload({
      filename: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size
    });

    return {
      ...result,
      mimetype: file.mimetype,
      size: file.size
    };
  }
}