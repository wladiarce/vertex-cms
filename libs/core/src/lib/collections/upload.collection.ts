import { Collection, Field, FieldType } from '@vertex-cms/common';

/**
 * Collection for storing media uploads
 */
@Collection({
  slug: 'uploads',
  singularName: 'Upload',
  pluralName: 'Uploads',
  timestamps: true,
  drafts: false, // Uploads don't use the draft system
  access: {
    read: ['admin', 'public'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class Upload {
  @Field({ type: FieldType.Text, required: true })
  filename!: string;

  @Field({ type: FieldType.Text, required: true })
  originalName!: string;

  @Field({ type: FieldType.Text, required: true })
  url!: string;

  @Field({ type: FieldType.Text })
  key?: string;

  @Field({ type: FieldType.Text, required: true })
  mimetype!: string;

  @Field({ type: FieldType.Number, required: true })
  size!: number;

  @Field({ type: FieldType.Text })
  alt?: string;

  @Field({ type: FieldType.Text })
  caption?: string;

  @Field({ type: FieldType.Number })
  width?: number;

  @Field({ type: FieldType.Number })
  height?: number;

  @Field({ type: FieldType.Blocks }) // Using Blocks or Mixed for formats
  formats?: Record<string, string>;

  @Field({ type: FieldType.Blocks }) // Using Blocks or Mixed for metadata
  metadata?: Record<string, any>;
}
