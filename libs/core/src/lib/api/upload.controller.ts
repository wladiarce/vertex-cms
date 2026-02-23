import { Controller, Post, Get, Patch, Delete, UseInterceptors, UploadedFile, UseGuards, Param, Body, Query, Optional, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageAdapter } from '@vertex/common';
import { ImageProcessorService } from '../services/image-processor.service';
import { PluginRegistryService } from '../services/plugin-registry.service';
import { DatabaseRegistryService } from '../services/database-registry.service';
import { Upload } from '../collections/upload.collection';

@Controller('api/vertex/media')
@UseGuards(JwtAuthGuard)
export class UploadController {
  
  constructor(
    @Optional() private storage: StorageAdapter,
    private imageProcessor: ImageProcessorService,
    private pluginRegistry: PluginRegistryService,
    private readonly dbRegistry: DatabaseRegistryService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) 
  async uploadFile(@UploadedFile() file: any) {
    if (!this.storage) {
        throw new HttpException('Storage capability is not active. Please register a storage plugin.', HttpStatus.NOT_IMPLEMENTED);
    }

    console.log('[UploadController] Processing upload:', file.originalname);

    // 1. Upload original file
    const result = await this.storage.upload({
      filename: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size
    });

    // 2. Process image (if applicable) to get dimensions and variants
    const processingResult = await this.imageProcessor.processImage(file.buffer, file.mimetype);
    
    const formats: Record<string, string> = {};
    
    // 3. Upload all variants
    if (processingResult) {
      for (const [variantKey, variantBuffer] of Object.entries(processingResult.variants)) {
        if (variantBuffer) {
          const variantFilename = this.imageProcessor.generateVariantFilename(result.key || file.originalname, variantKey);
          const variantResult = await this.storage.upload({
            filename: variantFilename,
            buffer: variantBuffer,
            mimetype: 'image/webp',
            size: variantBuffer.length
          });
          formats[variantKey] = variantResult.url;
        }
      }
    }

    // 4. Save to database
    const repository = this.dbRegistry.getRepository('uploads');
    const savedUpload = await repository.create({
      filename: result.key || file.originalname,
      originalName: file.originalname,
      url: result.url,
      key: result.key,
      mimetype: file.mimetype,
      size: file.size,
      width: processingResult?.width,
      height: processingResult?.height,
      formats: Object.keys(formats).length > 0 ? formats : undefined
    });

    return savedUpload;
  }

  @Get()
  async getAllMedia(
    @Query('page') page = 1,
    @Query('limit') limit = 24,
    @Query('type') type?: string,
    @Query('search') search?: string
  ) {
    const query: any = {};
    
    // Filter by type
    if (type) {
      if (type === 'image') {
        query.mimetype = { $regex: '^image/' };
      } else if (type === 'video') {
        query.mimetype = { $regex: '^video/' };
      } else if (type === 'document') {
        query.mimetype = { $regex: '^application/' };
      }
    }

    // Search by filename
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const repository = this.dbRegistry.getRepository('uploads');
    const { docs: items, total } = await repository.findAll({
      filter: query,
      limit: Number(limit),
      skip,
      sort: { createdAt: -1 }
    });

    return {
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  @Get(':id')
  async getMediaById(@Param('id') id: string) {
    const repository = this.dbRegistry.getRepository('uploads');
    return repository.findOne(id);
  }

  @Patch(':id')
  async updateMedia(@Param('id') id: string, @Body() updateData: any) {
    // Only allow updating metadata fields
    const allowedFields = ['alt', 'caption', 'metadata'];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    const repository = this.dbRegistry.getRepository('uploads');
    return repository.update(id, updates);
  }

  @Delete()
  async bulkDelete(@Body('ids') ids: string[]) {
    if (!this.storage) {
       throw new HttpException('Storage capability is not active.', HttpStatus.NOT_IMPLEMENTED);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Invalid ids array');
    }

    // Find all uploads to delete
    const repository = this.dbRegistry.getRepository('uploads');
    
    // Agnostic ID filter: Adapters should handle this. 
    // For Mongoose, we might need to translate it back to _id: { $in: ids } in the adapter later.
    const { docs: uploads } = await repository.findAll({
      filter: this.pluginRegistry.getPluginsByType('database')[0]?.name === 'mongoose' 
          ? { _id: { $in: ids } } 
          : { id: ids },
      limit: ids.length
    });

    // Delete files from storage
    for (const upload of uploads) {
      try {
        if (upload.key) {
          await this.storage.delete(upload.key);
        }
        
        // Delete all variants too
        if (upload.formats) {
          for (const variantUrl of Object.values(upload.formats)) {
            if (variantUrl && typeof variantUrl === 'string') {
              const variantKey = variantUrl.split('/').pop();
              if (variantKey) {
                await this.storage.delete(variantKey);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error deleting file ${upload.key}:`, error);
      }
    }

    // Delete from database
    let deletedCount = 0;
    for (const id of ids) {
      await repository.delete(id);
      deletedCount++;
    }

    return { deleted: deletedCount };
  }
}