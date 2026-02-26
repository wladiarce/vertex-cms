import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'projects',
  singularName: 'Project',
  timestamps: true,
  drafts: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class Project {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ type: FieldType.Upload, hasMany: true })
  gallery: string[];

  @Field({ type: FieldType.Text })
  client: string;

  @Field({ type: FieldType.RichText })
  description: string;

  @Field({ type: FieldType.Relationship, relationTo: 'project-categories', hasMany: true })
  categories: string[];

  @Field({ type: FieldType.Text, hasMany: true }) // Treating tags as an array of strings natively
  tags: string[];
}
