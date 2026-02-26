import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'text',
  name: 'Text Content',
})
export class TextBlock {
  @Field({ type: FieldType.RichText, required: true })
  content: string;
}
