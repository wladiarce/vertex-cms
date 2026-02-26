import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { ContentService } from '@vertex-cms/core';
import { DocumentStatus } from '@vertex-cms/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const contentService = app.get(ContentService);

  console.log('Seeding Demo content...');
  
  try {
    // 1. Create Users
    console.log('Creating users...');
    const users = [
      {
        email: 'admin@vertex.dev',
        password: 'admin',
        name: 'Vertex Admin',
        collections: ['blog-posts', 'blog-categories', 'products', 'product-categories', 'projects', 'project-categories', 'pages', 'doc-pages', 'users'],
        readOnly: false
      },
      {
        email: 'demo-blog@vertex.dev',
        password: 'demo',
        name: 'Blog Editor',
        collections: ['blog-posts', 'blog-categories', 'users'],
        readOnly: true
      },
      {
        email: 'demo-ecom@vertex.dev',
        password: 'demo',
        name: 'E-commerce Manager',
        collections: ['products', 'product-categories'],
        readOnly: true
      },
      {
        email: 'demo-port@vertex.dev',
        password: 'demo',
        name: 'Portfolio Curator',
        collections: ['projects', 'project-categories'],
        readOnly: true
      }
    ];

    for (const user of users) {
      try {
        await contentService.create('users', user);
      } catch (e) {
        console.log(e);
        console.log(`User ${user.email} already exists or failed to create.`);
      }
    }

    // 2. Create Blog Categories
    console.log('Creating blog categories...');
    let newsCat, tutorialCat;
    try {
      newsCat = await contentService.create('blog-categories', { name: 'News', slug: 'news' });
    } catch (e) {
      console.log('News category already exists, retrieving...');
      const results = await contentService.findAll('blog-categories', { slug: 'news' });
      newsCat = results.docs[0];
    }

    try {
      tutorialCat = await contentService.create('blog-categories', { name: 'Tutorials', slug: 'tutorials' });
    } catch (e) {
      console.log('Tutorials category already exists, retrieving...');
      const results = await contentService.findAll('blog-categories', { slug: 'tutorials' });
      tutorialCat = results.docs[0];
    }

    // 3. Create Blog Posts
    console.log('Creating blog posts...');
    try {
      await contentService.create('blog-posts', {
        title: 'Building a Blog with VertexCMS',
        slug: 'building-a-blog-with-vertex',
        excerpt: 'Learn how to use Collections, Blocks, and the Angular API client...',
        content: '<h1>Getting Started</h1><p>VertexCMS makes it easy to build content-driven applications...</p>',
        categories: [tutorialCat.id], // Use .id which is the virtual alias for _id
        status: DocumentStatus.Published,
        publishedAt: new Date()
      });
    } catch (e) {
      console.log('Blog post already exists.');
    }

    // 4. Create Product Categories
    console.log('Creating product categories...');
    let electronicsCat;
    try {
      electronicsCat = await contentService.create('product-categories', { name: 'Electronics', slug: 'electronics' });
    } catch (e) {
      const results = await contentService.findAll('product-categories', { slug: 'electronics' });
      electronicsCat = results.docs[0];
    }

    // 5. Create Products
    console.log('Creating products...');
    try {
      await contentService.create('products', {
        name: 'Smart Watch',
        slug: 'smart-watch',
        price: 299,
        description: '<p>A premium smart watch with all the latest features.</p>',
        categories: [electronicsCat.id],
        status: DocumentStatus.Published
      });
    } catch (e) {}

    // 6. Create Project Categories
    console.log('Creating project categories...');
    let brandingCat;
    try {
      brandingCat = await contentService.create('project-categories', { name: 'Branding', slug: 'branding' });
    } catch (e) {
      const results = await contentService.findAll('project-categories', { slug: 'branding' });
      brandingCat = results.docs[0];
    }

    // 7. Create Projects
    console.log('Creating projects...');
    try {
      await contentService.create('projects', {
        title: 'Brand Identity XYZ',
        slug: 'brand-identity-xyz',
        client: 'Vertex CMS',
        description: '<p>A comprehensive rebrand for a modern SaaS company.</p>',
        categories: [brandingCat.id],
        tags: ['Design', 'Branding'],
        status: DocumentStatus.Published
      });
    } catch (e) {}

    // 8. Create Doc Pages
    console.log('Creating doc pages...');
    try {
      await contentService.create('doc-pages', {
        title: 'Installation',
        slug: 'installation',
        category: 'getting-started',
        order: 1,
        content: '# Installation\n\nRun `npx create-vertex-app@latest`',
        description: 'How to install VertexCMS',
        status: DocumentStatus.Published
      });
    } catch (e) {}

    console.log('Seed script complete.');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
