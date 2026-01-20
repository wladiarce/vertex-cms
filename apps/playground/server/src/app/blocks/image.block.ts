import { Block, Field, FieldType } from '@vertex/common';

@Block({
  slug: 'image',
  label: 'Image'
})
export class ImageBlock {
  @Field({ type: FieldType.Upload, label: 'Picture' })
  image: any; // We store the object { url: ... }

  @Field({ type: FieldType.Text, label: 'Caption' })
  caption: string;
}