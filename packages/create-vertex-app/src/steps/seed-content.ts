import { promises as fs } from 'fs';
import * as path from 'path';
import { ScaffolderOptions } from '../prompts';

export async function seedContent(options: ScaffolderOptions): Promise<void> {
  const serverPath = path.join(process.cwd(), options.projectName, `apps/${options.projectName}-server/src/app`);
  
  // Create Collections
  await fs.writeFile(path.join(serverPath, 'collections', 'page.collection.ts'), PAGE_COLLECTION);
  await fs.writeFile(path.join(serverPath, 'collections', 'post.collection.ts'), POST_COLLECTION);
  await fs.writeFile(path.join(serverPath, 'collections', 'user.collection.ts'), USER_COLLECTION);
  
  // Create Blocks
  await fs.writeFile(path.join(serverPath, 'blocks', 'hero.block.ts'), HERO_BLOCK);
  await fs.writeFile(path.join(serverPath, 'blocks', 'text.block.ts'), TEXT_BLOCK);
  
  // Seed Script
  const scriptsDir = path.join(process.cwd(), options.projectName, `apps/${options.projectName}-server/src/scripts`);
  await fs.mkdir(scriptsDir, { recursive: true });
  await fs.writeFile(path.join(scriptsDir, 'seed.ts'), SEED_SCRIPT);
}

const PAGE_COLLECTION = `import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'pages',
  singularName: 'Page',
  timestamps: true,
  drafts: true,
  access: {
    read: ['public'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class Page {
  @Field({ type: FieldType.Text, required: true, localized: true })
  title!: string;

  @Field({ type: FieldType.Text, required: true })
  slug!: string;

  @Field({ type: FieldType.Blocks })
  content!: any;
}
`;

const POST_COLLECTION = `import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'posts',
  singularName: 'Post',
  timestamps: true,
  drafts: true,
  access: {
    read: ['public'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class Post {
  @Field({ type: FieldType.Text, required: true, localized: true })
  title!: string;

  @Field({ type: FieldType.RichText })
  body!: any;

  @Field({ type: FieldType.Upload })
  coverImage?: any;
}
`;

const USER_COLLECTION = `import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: 'users',
  singularName: 'User',
  timestamps: true,
  drafts: false,
  access: {
    read: ['admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class User {
  @Field({ type: FieldType.Email, required: true })
  email!: string;

  @Field({ type: FieldType.Text, required: true })
  password!: string;

  @Field({ type: FieldType.Text, required: true })
  name!: string;
}
`;

const HERO_BLOCK = `import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({ slug: 'hero', label: 'Hero Section' })
export class HeroBlock {
  @Field({ type: FieldType.Text, required: true })
  headline!: string;

  @Field({ type: FieldType.Text })
  subheadline?: string;
}
`;

const TEXT_BLOCK = `import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({ slug: 'text', label: 'Rich Text Block' })
export class TextBlock {
  @Field({ type: FieldType.RichText, required: true })
  content!: any;
}
`;

const SEED_SCRIPT = `import * as bcrypt from 'bcryptjs';
// This script assumes execution via ts-node within the server context.
console.log('Seeding process starting...');
// Mock for now, real seed creates the mongoose docs etc
console.log('Seed completed!');
`;
