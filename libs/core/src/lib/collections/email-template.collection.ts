import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: '_email_templates',
  singularName: 'Email Template',
  timestamps: true,
  drafts: false,
  access: { read: ['admin'], create: ['admin'], update: ['admin'], delete: ['admin'] }
})
export class EmailTemplate {
  @Field({ type: FieldType.Text, required: true, unique: true })
  slug!: string;          // "password-reset", "welcome", "notification"

  @Field({ type: FieldType.Text, required: true })
  name!: string;          // "Password Reset Email"

  @Field({ type: FieldType.Text, required: true })
  subject!: string;       // "Reset your password for {{appName}}"

  @Field({ type: FieldType.RichText, required: true })
  htmlBody!: string;      // HTML with {{variables}}

  @Field({ type: FieldType.Text })
  textBody?: string;     // Plain text fallback

  @Field({ type: FieldType.Text })
  variables?: string;     // JSON array or comma-separated list of variable names
}
