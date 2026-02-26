import { Block, Field, FieldType, RepeatBlock } from '@vertex-cms/common';

/**
 * Pricing Section Block
 *
 * Renders a row of plan cards.
 */

@RepeatBlock()
export class PricingPlan {
  @Field({ type: FieldType.Text, required: true })
  planName: string;

  @Field({ type: FieldType.Text, label: 'Price (or "Free")' })
  price: string;

  @Field({ type: FieldType.Boolean })
  featured: boolean;

  @Field({ type: FieldType.RichText, label: 'Features (List)' })
  features: string;
}
@Block({
  slug: 'pricing',
  name: 'Pricing Section',
})
export class PricingBlock {
  /** Section headline shown above the plan cards */
  @Field({ type: FieldType.Text })
  headline: string;

  /** Optional subheading */
  @Field({ type: FieldType.Text })
  subheadline: string;

  @Field({
    type: FieldType.Repeater,
    repeaterBlock: PricingPlan,
    label: 'Plans',
  })
  plans: PricingPlan[];
}

