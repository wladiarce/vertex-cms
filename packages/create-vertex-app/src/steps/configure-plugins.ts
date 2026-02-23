import { promises as fs } from 'fs';
import * as path from 'path';
import { ScaffolderOptions } from '../prompts';

export async function configurePlugins(options: ScaffolderOptions): Promise<void> {
  const serverPath = path.join(process.cwd(), options.projectName, `apps/${options.projectName}-server/src/app`);
  const appModulePath = path.join(serverPath, 'app.module.ts');
  
  // Create directories if they don't exist
  await fs.mkdir(path.join(serverPath, 'collections'), { recursive: true });
  await fs.mkdir(path.join(serverPath, 'blocks'), { recursive: true });

  const isMongo = options.database === 'mongo';
  const importPlugin = isMongo 
    ? `import { DatabaseMongoPlugin } from '@vertex-cms/plugin-db-mongo';` 
    : `import { DatabaseTypeORMPlugin } from '@vertex-cms/plugin-db-typeorm';`;
    
  const usePlugin = isMongo
    ? `DatabaseMongoPlugin({ uri: process.env.VERTEX_MONGO_URI || 'mongodb://localhost:27017/${options.projectName}' })`
    : `DatabaseTypeORMPlugin({ type: 'postgres', url: process.env.VERTEX_POSTGRES_URI })`; // We might need a typeorm plugin from vertex

  // Here we replace the default app.module.ts
  const template = `import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex-cms/core';
${importPlugin}
import { StorageLocalPlugin } from '@vertex-cms/plugin-storage-local';
import * as path from 'path';

// Collections
${options.includeExamples ? "import { Page } from './collections/page.collection';\nimport { Post } from './collections/post.collection';\nimport { User } from './collections/user.collection';" : ""}

// Blocks
${options.includeExamples ? "import { HeroBlock } from './blocks/hero.block';\nimport { TextBlock } from './blocks/text.block';" : ""}

@Module({
  imports: [
    VertexCoreModule.forRoot({
      entities: [
        ${options.includeExamples ? "Page, Post, User," : ""}
      ],
      blocks: [
        ${options.includeExamples ? "HeroBlock, TextBlock" : ""}
      ],
      database: ${usePlugin},
      storage: StorageLocalPlugin({
        uploadPath: path.join(process.cwd(), 'uploads')
      }),
      auth: {
        jwt: {
          secret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production',
          expiresIn: '7d'
        }
      },
      plugins: []
    })
  ]
})
export class AppModule {}
`;

  await fs.writeFile(appModulePath, template);
}
