import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'products',
  singularName: 'Product',
  timestamps: true,
  drafts: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class Product {
  @Field({ type: FieldType.Text, required: true })
  name: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ type: FieldType.Upload, hasMany: true })
  images: string[];

  @Field({ type: FieldType.Number, required: true })
  price: number;

  @Field({ type: FieldType.RichText })
  description: string;

  @Field({ type: FieldType.Relationship, relationTo: 'product-categories', hasMany: true })
  categories: string[];
}
