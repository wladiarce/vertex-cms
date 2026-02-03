import { Collection, Field, FieldType } from '@vertex/common';
import * as bcrypt from 'bcryptjs';

@Collection({
  slug: 'users',
  singularName: 'User',
  timestamps: true,
  drafts: false,
  hooks: {
    // 1. Hash password before saving
    beforeChange: async ({ data, operation }) => {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      return data;
    },
    // 2. Remove password before sending to API
    afterRead: ({ doc }) => {
      delete doc.password;
      return doc;
    }
  }
})
export class User {
  @Field({ type: FieldType.Email, required: true, unique: true })
  email: string;

  @Field({ type: FieldType.Text, required: true, label: 'Password' })
  password: string;

  @Field({ type: FieldType.Text, label: 'Full Name' })
  name: string;
}