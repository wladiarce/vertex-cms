import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex-cms/core';
import { DatabaseMongoPlugin } from '@vertex-cms/plugin-db-mongo';
import { StorageLocalPlugin } from '@vertex-cms/plugin-storage-local';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Collections
import { User } from './collections/user.collection';
import { DocPage } from './collections/doc-page.collection';
import { BlogPost } from './collections/blog-post.collection';
import { BlogCategory } from './collections/blog-category.collection';
import { Product } from './collections/product.collection';
import { ProductCategory } from './collections/product-category.collection';
import { Project } from './collections/project.collection';
import { ProjectCategory } from './collections/project-category.collection';
import { Page } from './collections/page.collection';

// Blocks
import { HeroBlock } from './blocks/hero.block';
import { TextBlock } from './blocks/text.block';
import { ImageBlock } from './blocks/image.block';
import { CodeBlock } from './blocks/code-block.block';
import { FeatureGridBlock } from './blocks/feature-grid.block';
import { PricingBlock } from './blocks/pricing.block';
import { ProductCardBlock } from './blocks/product-card.block';
import { ProjectGalleryBlock } from './blocks/project-gallery.block';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOAD_PATH || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    VertexCoreModule.forRoot({
      database: DatabaseMongoPlugin({
        uri: process.env.MONGO_URI || ''
      }),
      entities: [
        User, DocPage, BlogPost, BlogCategory, Product, ProductCategory, 
        Project, ProjectCategory, Page
      ],
      storage: StorageLocalPlugin({
        uploadDir: join(process.cwd(), 'uploads')
      })
    })
  ]
})
export class AppModule {}
