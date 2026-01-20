import { Block, Field, FieldType } from '@vertex/common';

@Block({
  slug: 'hero',
  label: 'Hero Section'
})
export class HeroBlock {
  @Field({ type: FieldType.Text, label: 'Headline' })
  headline: string;

  @Field({ type: FieldType.Text, label: 'Subheadline' })
  subheadline: string;
}