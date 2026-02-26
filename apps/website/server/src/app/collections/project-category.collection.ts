import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'project-categories',
  singularName: 'Project Category',
  timestamps: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class ProjectCategory {
  @Field({ type: FieldType.Text, required: true })
  name: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;
}
