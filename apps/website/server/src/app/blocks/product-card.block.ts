import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'product-card',
  name: 'Product Card',
})
export class ProductCardBlock {
  @Field({ type: FieldType.Relationship, relationTo: 'products', required: true })
  product: string;
}
