import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'text-rich',
  label: 'Rich text'
})
export class TextBlock {
  @Field({ type: FieldType.RichText, label: 'Content' })
  content: string;
}