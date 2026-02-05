import { Collection, Field, FieldType } from '@vertex/common';

@Collection({
  slug: 'tags',
  singularName: 'Tag',
  pluralName: 'Tags',
  drafts: false,
  timestamps: true
})
export class Tag {
  @Field({ type: FieldType.Text, required: true, label: 'Name' })
  name!: string;

  @Field({ type: FieldType.Text, required: true, label: 'Slug' })
  slug!: string;
}
