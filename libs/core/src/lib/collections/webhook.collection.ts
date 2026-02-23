import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: '_webhooks',
  singularName: 'Webhook',
  timestamps: true,
  drafts: false,
  access: { 
    read: ['admin'], 
    create: ['admin'], 
    update: ['admin'], 
    delete: ['admin'] 
  }
})
export class Webhook {
  @Field({ type: FieldType.Text, required: true })
  name!: string;

  @Field({ type: FieldType.Text, required: true })
  url!: string;

  @Field({ type: FieldType.Text })
  secret?: string; // For signing payloads

  @Field({ type: FieldType.Boolean, defaultValue: true })
  active!: boolean;

  // Storing events as comma-separated string, e.g., 'pages:create,pages:update'
  @Field({ type: FieldType.Text, required: true })
  events!: string;
}
