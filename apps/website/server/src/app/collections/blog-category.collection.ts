import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'blog-categories',
  singularName: 'Blog Category',
  timestamps: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class BlogCategory {
  @Field({ type: FieldType.Text, required: true })
  name: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;
}
