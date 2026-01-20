import { Block, Field, FieldType } from '@vertex/common';

@Block({
  slug: 'text-simple',
  label: 'Simple Text'
})
export class TextBlock {
  @Field({ type: FieldType.RichText, label: 'Content' })
  content: string;
}