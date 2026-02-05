import { Collection, Field, FieldType } from '@vertex/common';

@Collection({
  slug: 'authors',
  singularName: 'Author',
  drafts: false,
  timestamps: true
})
export class Author {
  @Field({ type: FieldType.Text, required: true, label: 'Name' })
  name!: string;

  @Field({ type: FieldType.Email, required: true, label: 'Email' })
  email!: string;

  @Field({ type: FieldType.Text, label: 'Bio' })
  bio?: string;
}
