import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'image',
  name: 'Image',
})
export class ImageBlock {
  @Field({ type: FieldType.Upload, required: true })
  image: string;

  @Field({ type: FieldType.Text })
  caption: string;
}
