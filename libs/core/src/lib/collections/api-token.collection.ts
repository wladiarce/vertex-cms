import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: '_api_tokens',
  singularName: 'API Token',
  timestamps: true,
  drafts: false,
  access: { 
    read: ['admin'], 
    create: ['admin'], 
    update: ['admin'], 
    delete: ['admin'] 
  }
})
export class ApiToken {
  @Field({ type: FieldType.Text, required: true })
  name!: string;

  @Field({ type: FieldType.Text, required: true })
  tokenHash!: string;

  @Field({ type: FieldType.Text, required: true })
  prefix!: string;

  // Storing scopes as a comma-separated string or JSON string to avoid array modeling issues
  @Field({ type: FieldType.Text, required: true })
  scopes!: string; 

  @Field({ type: FieldType.Date })
  lastUsedAt?: Date;

  @Field({ type: FieldType.Date })
  expiresAt?: Date;

  @Field({ type: FieldType.Boolean, defaultValue: false })
  revoked!: boolean;

  @Field({ type: FieldType.Text })
  createdBy!: string;
}
