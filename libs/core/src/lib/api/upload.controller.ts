import { Controller, Post, Get, Patch, Delete, UseInterceptors, UploadedFile, UseGuards, Param, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageAdapter } from '@vertex/common';
import { ImageProcessorService } from '../services/image-processor.service';
import { Upload, UploadDocument } from '../schema/upload.schema';


@Controller('api/vertex/media')
@UseGuards(JwtAuthGuard)
export class UploadController {
  
  constructor(
    private storage: StorageAdapter,
    private imageProcessor: ImageProcessorService,
    @InjectModel(Upload.name) private uploadModel: Model<UploadDocument>
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) 
  async uploadFile(@UploadedFile() file: any) {
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
    const upload = new this.uploadModel({
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

    const savedUpload = await upload.save();

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
    
    const [items, total] = await Promise.all([
      this.uploadModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      this.uploadModel.countDocuments(query)
    ]);

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
    return this.uploadModel.findById(id);
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

    return this.uploadModel.findByIdAndUpdate(id, updates, { new: true });
  }

  @Delete()
  async bulkDelete(@Body('ids') ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Invalid ids array');
    }

    // Find all uploads to delete
    const uploads = await this.uploadModel.find({ _id: { $in: ids } });

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
    const result = await this.uploadModel.deleteMany({ _id: { $in: ids } });

    return { deleted: result.deletedCount };
  }
}