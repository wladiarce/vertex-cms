import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'feature-grid',
  name: 'Feature Grid',
})
export class FeatureGridBlock {
  @Field({ type: FieldType.Blocks, hasMany: true })
  features: string[]; // Represented as sub-blocks or a simple array depending on Vertex CMS capabilities. For now let's just use an array of objects. 
                     // Wait, in VertexCMS we don't have sub-blocks inside blocks yet out of the box unless it's a relationship. We'll use a JSON field or rich text. 
                     // Or just make it a simpler layout for now. Let's make it a title/text grid.
}
