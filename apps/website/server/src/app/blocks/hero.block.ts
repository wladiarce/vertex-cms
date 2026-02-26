import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'hero',
  name: 'Hero Section',
})
export class HeroBlock {
  @Field({ type: FieldType.Text, required: true })
  headline: string;

  @Field({ type: FieldType.Text })
  subheadline: string;

  @Field({ type: FieldType.Text })
  ctaText: string;

  @Field({ type: FieldType.Text })
  ctaLink: string;

  @Field({ type: FieldType.Upload })
  backgroundImage: string;
}
