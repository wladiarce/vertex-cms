import { Block, Field, FieldType } from '@vertex-cms/common';

/**
 * Pricing Section Block
 *
 * Renders a row of plan cards. Each plan has:
 *   - planName  : Display name (e.g. "Pro", "Enterprise")
 *   - price     : Number or the string "Free"
 *   - featured  : Highlight this card (accent border + badge)
 *   - features  : Bullet list of feature strings (stored as newline-separated text)
 */
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

  // ── Plans (stored as a JSON text field; frontend parses it) ──────────────
  // Each plan JSON object: { planName, price, featured, features: string[] }
  // Stored as a JSON string in a Text field (simplest approach given current
  // block field limitations — no nested block support yet).
  @Field({
    type: FieldType.RichText,
    label: 'Plans (JSON)',
  })
  plans: string; // JSON: Array<{ planName: string; price: number | 'Free'; featured?: boolean; features: string[] }>
}
