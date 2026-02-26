import { Collection, Field, FieldType } from '@vertex-cms/common';
import * as bcrypt from 'bcryptjs';

@Collection({
  slug: 'users',
  singularName: 'User',
  timestamps: true,
  drafts: false,
  hooks: {
    beforeChange: async ({ data, operation }) => {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      return data;
    },
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

  @Field({ type: FieldType.Select, options: [
      {label: 'Blog Posts', value: 'blog-posts'},
      {label: 'Blog Categories', value: 'blog-categories'},
      {label: 'Products', value: 'products'},
      {label: 'Product Categories', value: 'product-categories'},
      {label: 'Projects', value: 'projects'},
      {label: 'Project Categories', value: 'project-categories'},
      {label: 'Pages', value: 'pages'},
      {label: 'Documentation', value: 'doc-pages'},
      {label: 'Users', value: 'users'}
  ], hasMany: true })
  collections?: string[];

  @Field({ type: FieldType.Boolean, defaultValue: false })
  readOnly?: boolean;
}
