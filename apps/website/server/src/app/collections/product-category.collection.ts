import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'product-categories',
  singularName: 'Product Category',
  timestamps: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class ProductCategory {
  @Field({ type: FieldType.Text, required: true })
  name: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;
}
