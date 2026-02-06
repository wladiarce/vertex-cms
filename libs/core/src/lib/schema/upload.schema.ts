import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UploadDocument = Upload & Document;

@Schema({ timestamps: true })
export class Upload {
  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  originalName!: string;

  @Prop({ required: true })
  url!: string;

  @Prop()
  key?: string;

  @Prop({ required: true })
  mimetype!: string;

  @Prop({ required: true })
  size!: number;

  // Metadata
  @Prop()
  alt?: string;

  @Prop()
  caption?: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  // Generated formats (WebP versions, thumbnails, responsive sizes)
  @Prop({ type: Object })
  formats?: {
    thumbnail_150?: string;
    thumbnail_300?: string;
    sm?: string;  // 640px
    md?: string;  // 768px
    lg?: string;  // 1024px
    xl?: string;  // 1280px
  };

  // Custom metadata fields
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UploadMongooseSchema = SchemaFactory.createForClass(Upload);
