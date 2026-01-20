import { Collection, Field, FieldType } from '@vertex/common';
import { HeroBlock } from '../blocks/hero.block';
import { TextBlock } from '../blocks/text.block';

@Collection({
  slug: 'pages',
  singularName: 'Page',
  timestamps: true
})
export class Page {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ 
    type: FieldType.Blocks, 
    blocks: [HeroBlock, TextBlock]
  })
  layout: any[];
}