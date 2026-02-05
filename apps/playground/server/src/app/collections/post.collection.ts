import { Collection, Field, FieldType } from '@vertex/common';

@Collection({
  slug: 'posts',
  singularName: 'Post',
  drafts: true,
  timestamps: true
})
export class Post {
  @Field({ type: FieldType.Text, required: true, label: 'Title' })
  title!: string;

  @Field({ type: FieldType.Text, required: true, label: 'Slug' })
  slug!: string;

  @Field({ type: FieldType.Text, label: 'Excerpt' })
  excerpt?: string;

  @Field({ type: FieldType.RichText, required: true, label: 'Content' })
  content!: string;

  @Field({ 
    type: FieldType.Relationship, 
    relationTo: 'authors',
    required: true,
    label: 'Author'
  })
  author!: string;

  @Field({ 
    type: FieldType.Relationship, 
    relationTo: 'tags',
    relationMany: true,
    label: 'Tags'
  })
  tags!: string[];
}
