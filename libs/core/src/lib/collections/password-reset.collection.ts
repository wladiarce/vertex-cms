import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: '_password_resets',
  singularName: 'Password Reset',
  timestamps: true,
  drafts: false,
  access: { read: [], create: [], update: [], delete: [] } // Fully internal
})
export class PasswordReset {
  @Field({ type: FieldType.Text, required: true })
  userId!: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  tokenHash!: string;     // SHA-256 hash of the reset token

  @Field({ type: FieldType.Date, required: true })
  expiresAt!: Date;       // Default: 1 hour from creation

  @Field({ type: FieldType.Boolean, required: true })
  used!: boolean;         // true after token is consumed
}
