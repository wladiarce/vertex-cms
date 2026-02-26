import { Collection, Field, FieldType } from '@vertex-cms/common';
import { HeroBlock } from '../blocks/hero.block';
import { TextBlock } from '../blocks/text.block';
import { ImageBlock } from '../blocks/image.block';
import { CodeBlock } from '../blocks/code-block.block';
import { FeatureGridBlock } from '../blocks/feature-grid.block';
import { PricingBlock } from '../blocks/pricing.block';
import { ProductCardBlock } from '../blocks/product-card.block';
import { ProjectGalleryBlock } from '../blocks/project-gallery.block';

@Collection({
  slug: 'pages',
  singularName: 'Page',
  timestamps: true,
  drafts: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class Page {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ type: FieldType.Blocks, blocks: [
    HeroBlock, TextBlock, ImageBlock, CodeBlock, FeatureGridBlock, 
    PricingBlock, ProductCardBlock, ProjectGalleryBlock
  ] })
  content: any[];
}
