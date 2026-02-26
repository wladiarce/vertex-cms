import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'doc-pages',
  singularName: 'Doc Page',
  timestamps: true,
  drafts: true,
  access: { read: ['public'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class DocPage {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ type: FieldType.Select, options: [
    { label: 'Getting Started', value: 'getting-started' },
    { label: 'Core Concepts', value: 'core-concepts' },
    { label: 'Guides', value: 'guides' },
    { label: 'API Reference', value: 'api-reference' },
    { label: 'Migration', value: 'migration' }
  ], required: true })
  category: string;

  @Field({ type: FieldType.Number, required: true })
  order: number;

  @Field({ type: FieldType.RichText, required: true })
  content: string;

  @Field({ type: FieldType.Text })
  description: string;
}
