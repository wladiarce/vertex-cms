import { Collection, Field, FieldType } from '@vertex/common';
import { HeroBlock } from '../blocks/hero.block';
import { TextBlock } from '../blocks/text.block';
import { ImageBlock } from '../blocks/image.block';

@Collection({
  slug: 'pages',
  singularName: 'Page',
  timestamps: true,
  access: {
    read: ['public'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class Page {
  @Field({ type: FieldType.Text, required: true, localized: true })
  title: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ 
    type: FieldType.Blocks, 
    blocks: [HeroBlock, TextBlock, ImageBlock]
  })
  layout: any[];
}