import { Injectable } from '@nestjs/common';
const sharp = require('sharp');
import * as path from 'path';

export interface ImageProcessingResult {
  width: number;
  height: number;
  variants: {
    thumbnail_150?: Buffer;
    thumbnail_300?: Buffer;
    sm?: Buffer;
    md?: Buffer;
    lg?: Buffer;
    xl?: Buffer;
  };
}

@Injectable()
export class ImageProcessorService {
  
  private readonly sizes = {
    thumbnail_150: 150,
    thumbnail_300: 300,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  };

  /**
   * Process an image: extract dimensions and generate variants
   * @param buffer Original image buffer
   * @param mimetype Image mimetype
   * @returns Processing result with dimensions and variants
   */
  async processImage(buffer: Buffer, mimetype: string): Promise<ImageProcessingResult | null> {
    // Only process images
    if (!mimetype.startsWith('image/')) {
      return null;
    }

    try {
      // TODO: Uncomment when sharp is installed
      const sharpInstance = sharp(buffer);
      const metadata = await sharpInstance.metadata();
      
      const variants: ImageProcessingResult['variants'] = {};

      // Generate all size variants as WebP
      for (const [key, size] of Object.entries(this.sizes)) {
        const resized = await sharp(buffer)
          .resize(size, size, {
            fit: key.startsWith('thumbnail') ? 'cover' : 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toBuffer();
        
        variants[key as keyof ImageProcessingResult['variants']] = resized;
      }

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        variants
      };

      // Placeholder until sharp is installed
    //   console.log('[ImageProcessorService] Sharp not installed yet - skipping image processing');
    //   return {
    //     width: 0,
    //     height: 0,
    //     variants: {}
    //   };
      
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  }

  /**
   * Generate a filename for a variant
   * @param originalFilename Original filename
   * @param variant Variant key (e.g., 'thumbnail_150', 'md')
   * @returns Modified filename
   */
  generateVariantFilename(originalFilename: string, variant: string): string {
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    return `${basename}_${variant}.webp`;
  }
}
