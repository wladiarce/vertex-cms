import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'project-gallery',
  name: 'Project Gallery',
})
export class ProjectGalleryBlock {
  @Field({ type: FieldType.Relationship, relationTo: 'projects', hasMany: true, required: true })
  projects: string[];
}
