import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'blog-posts',
  singularName: 'Blog Post',
  timestamps: true,
  drafts: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class BlogPost {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ type: FieldType.Upload })
  featuredImage: string;

  @Field({ type: FieldType.Text })
  excerpt: string;

  @Field({ type: FieldType.RichText })
  content: string;

  @Field({ type: FieldType.Relationship, relationTo: 'users' })
  author: string;

  @Field({ type: FieldType.Relationship, relationTo: 'blog-categories', hasMany: true })
  categories: string[];

  @Field({ type: FieldType.Date })
  publishedAt: Date;
}
