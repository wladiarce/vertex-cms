import { Collection, Field, FieldType } from '@vertex/common';

/**
 * Internal collection for storing document version history
 * This collection tracks all versions of published documents
 */
@Collection({
  slug: '_versions',
  singularName: 'Version',
  timestamps: true,
  drafts: false, // Versions collection itself doesn't need versioning
  access: {
    read: ['admin'],
    create: ['admin'],
    update: [],
    delete: ['admin']
  }
})
export class Version {
  @Field({ type: FieldType.Text, required: true })
  collectionSlug!: string;

  @Field({ type: FieldType.Text, required: true })
  documentId!: string;

  @Field({ type: FieldType.Text })
  data!: string; // JSON stringified snapshot of the document

  @Field({ type: FieldType.Text })
  createdBy!: string; // User ID who created this version

  @Field({ type: FieldType.Number })
  versionNumber!: number;
}
