# VertexCMS - Architecture & framework documentation

> **Version**: 0.1  
> **Last Updated**: January 2026

## Table of Contents

1. [Overview](#overview)
2. [Core concepts](#core-concepts)
3. [Architecture](#architecture)
4. [Library structure](#library-structure)
5. [How it works](#how-it-works)
6. [Usage guide](#usage-guide)
7. [API reference](#api-reference)
8. [Advanced topics](#advanced-topics)

---

## Overview

**VertexCMS** is a code-first, block-based content management system built natively for the **Angular + NestJS** ecosystem. Unlike traditional headless CMSs that treat Angular as a second-class citizen, VertexCMS leverages the architectural patterns that both Angular and NestJS share (decorators, dependency injection, modules) to provide a seamless development experience.

### Key philosophy

- **Code-first**: Your TypeScript code is the source of truth. Define schemas using decorators, and the system automatically generates database models, REST APIs, and admin UI.
- **Block-driven**: Content is composed of reusable blocks (like Hero, Text, Image) that map directly to Angular components.
- **Type-safe**: Shared interfaces between frontend and backend ensure compile-time safety.
- **SSR-ready**: Built-in support for Angular Server-Side Rendering with proper state transfer.

---

## Core concepts

### 1. Collections

Collections are the primary data structures in VertexCMS, similar to "content types" in other CMSs or database tables. They are defined using the `@Collection` decorator on a TypeScript class.

**Example:**
```typescript
@Collection({
  slug: 'pages',
  singularName: 'Page',
  timestamps: true,
  access: {
    read: ['public'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class Page {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ type: FieldType.Blocks, blocks: [HeroBlock, TextBlock] })
  layout: any[];
}
```

### 2. Fields

Fields define the properties of a collection. They are declared using the `@Field` decorator and support various types:

- **Primitives**: `Text`, `Number`, `Boolean`, `Date`, `Email`
- **Rich content**: `RichText` (WYSIWYG editor - tiptap)
- **Media**: `Upload` (file uploads)
- **Complex**: `Select`, `Relationship`, `Blocks` - some still WIP

**Field options:**
- `type`: The field type (required)
- `label`: Display name in admin UI
- `required`: Validation rule
- `unique`: Database constraint
- `defaultValue`: Default value
- `options`: For select fields
- `relationTo`: For relationship fields
- `blocks`: For block fields (array of Block classes)

### 3. Blocks

Blocks are reusable content components. Each block is defined in the backend with the `@Block` decorator and has a corresponding Angular component in the frontend.

**Backend block definition:**
```typescript
@Block({
  slug: 'hero',
  label: 'Hero Section'
})
export class HeroBlock {
  @Field({ type: FieldType.Text, label: 'Headline' })
  headline: string;

  @Field({ type: FieldType.Text, label: 'Subheadline' })
  subheadline: string;
}
```

**Frontend component:**
```typescript
@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <section class="hero">
      <h1>{{ data.headline }}</h1>
      <p>{{ data.subheadline }}</p>
    </section>
  `
})
export class HeroComponent {
  @Input() data: any; // Receives block data from CMS
}
```

### 4. Schema discovery

VertexCMS uses **runtime reflection** (via `reflect-metadata`) to extract decorator metadata and automatically:
- Generate Mongoose schemas
- Register database models
- Create REST API endpoints
- Generate admin UI forms

This happens at application startup when you register your collections with `VertexCoreModule.forRoot()`.

---

## Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                 Angular client - browser                        │
│  ┌─────────────────┐              ┌─────────────────────────┐   │
│  │  Public pages   │              │    Admin panel          │   │
│  │  (@vertex/      │              │    (@vertex/admin)      │   │
│  │   public)       │              │                         │   │
│  └─────────────────┘              └─────────────────────────┘   │
│         │                                    │                  │
│         │ HTTP Requests                      │ HTTP Requests    │
└─────────┼────────────────────────────────────┼──────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NestJS backend                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              VertexCoreModule (@vertex/core)             │   │
│  │  ┌────────────────┐  ┌──────────────┐  ┌─────────────┐   │   │
│  │  │ Schema         │  │ Content      │  │ Auth        │   │   │
│  │  │ Discovery      │  │ service      │  │ service     │   │   │
│  │  │ service        │  │              │  │             │   │   │
│  │  └────────────────┘  └──────────────┘  └─────────────┘   │   │
│  │         │                   │                 │          │   │
│  └─────────┼───────────────────┼─────────────────┼──────────┘   │
│            │                   │                 │              │
│            ▼                   ▼                 ▼              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │        Mongoose models (generated dynamically)          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │      MongoDB     |
                    └──────────────────┘
```

### Request flow

#### Public content rendering
1. User visits `/blog/my-post`
2. Angular `PublicPageComponent` extracts slug from URL
3. `CmsFetchService` queries `/api/content/pages?slug=my-post`
4. `ContentController` → `ContentService` → Mongoose Model
5. JSON response with page data and blocks array
6. `BlockRendererComponent` dynamically renders each block using `VertexRegistryService`
7. Matched Angular components receive block data via `@Input()`

#### Admin panel
1. Admin navigates to `/admin/collections/pages`
2. `VertexClientService.loadConfig()` fetches schema metadata from `/api/vertex/config`
3. Dynamic forms are generated based on field types
4. CRUD operations use generic REST endpoints: `/api/content/{slug}`
5. JWT authentication guards admin routes

---

## Library structure

VertexCMS is organized as an **Nx monorepo** with four core libraries:

### 1. `@vertex/common`

**Purpose**: Shared code between frontend and backend.

**Location**: `libs/common/`

**Key exports**:
- **Decorators**:
  - `@Collection(options)`: Marks a class as a collection
  - `@Field(options)`: Marks a property as a field
  - `@Block(options)`: Marks a class as a block
- **Interfaces**:
  - `CollectionMetadata`: Runtime schema representation
  - `FieldOptions`: Field configuration
  - `BlockMetadata`: Block schema
  - `StorageAdapter`: Interface for file upload adapters
- **Constants**:
  - `FieldType`: Enum of all field types
  - Metadata keys for reflection

**Why it's shared**: Both frontend and backend need to understand the same schema structure and field types.

---

### 2. `@vertex/core`

**Purpose**: NestJS backend engine.

**Location**: `libs/core/`

**Key components**:

#### Services
- **`SchemaDiscoveryService`**:
  - Reads metadata from decorated classes
  - Generates Mongoose schemas dynamically
  - Registers models with MongoDB
  - Exposes schema metadata to admin UI

- **`ContentService`**:
  - Generic CRUD operations for any collection
  - Pagination support
  - Hook execution (`beforeChange`, `afterRead`)
  - Query filtering (basic) (advanced querying WIP)

- **`AuthService`**:
  - JWT-based authentication
  - Login/register endpoints
  - Password hashing

#### Controllers
- **`ConfigController`**: Exposes schema metadata at `/api/vertex/config`
- **`ContentController`**: Generic CRUD at `/api/content/{slug}`
- **`AuthController`**: Handles `/api/auth/login` and `/api/auth/register`
- **`UploadController`**: File uploads at `/api/vertex/upload`

#### Storage Adapters
- **`LocalStorageAdapter`**: Stores files on disk
- **`S3Adapter`**: (WIP) AWS S3 integration

#### Module
- **`VertexCoreModule`**:
  - Dynamic module with `forRoot(options)` configuration
  - Accepts `mongoUri`, `collections[]`, and optional `storageAdapter`
  - Bootstraps schema discovery on startup

---

### 3. `@vertex/admin`

**Purpose**: Admin panel (Angular library).

**Location**: `libs/admin/`

**Key components**:

#### Services
- **`VertexClientService`**:
  - HTTP client for CMS API
  - `loadConfig()`: Fetches schema metadata
  - Generic CRUD methods: `getAll()`, `findOne()`, `create()`, `update()`, `delete()`
  - Upload method

- **`AuthService`**:
  - Manages authentication state
  - Stores JWT in localStorage
  - Provides `isAuthenticated` signal

#### Guards & Interceptors
- **`authGuard`**: Protects admin routes
- **`authInterceptor`**: Attaches JWT to outgoing requests

#### Routes
- **`adminRoutes`**:
  - `/admin/login`: Public login page
  - `/admin/dashboard`: Protected dashboard
  - `/admin/collections/:slug`: Dynamic collection list
  - `/admin/collections/:slug/create`: Create new entry
  - `/admin/collections/:slug/:id`: Edit existing entry

#### Components (Dynamically Loaded)
- `AdminLayoutComponent`: Main layout with sidebar
- `CollectionListComponent`: Generic data table
- `CollectionEditComponent`: Dynamic form builder
- `DashboardComponent`: Admin home

**Note**: The admin UI is entirely generated at runtime based on schema metadata. No manual form creation needed.

**WIP**: It is expected to improve the UI to be more user-friendly and modern. Also, it is expected to add more features to the admin panel, such as (brainstorming) a media library, a file manager, a theme manager...

---

### 4. `@vertex/public`

**Purpose**: Frontend SDK for rendering CMS content.

**Location**: `libs/public/`

**Key components**:

#### Services
- **`CmsFetchService`**:
  - Platform-aware HTTP requests (SSR and CSR)
  - SSR support with `TransferState`
  - Resolves URLs differently for server vs browser

- **`VertexRegistryService`**:
  - Maps block slugs to Angular components
  - Used by `BlockRendererComponent`

#### Components
- **`BlockRendererComponent`**:
  - Dynamically renders an array of blocks
  - Uses `*ngComponentOutlet` to instantiate components
  - Passes block data via `@Input() data`

**Usage Pattern**:
```typescript
// In app.config.ts
provideAppInitializer(() => {
  const registry = inject(VertexRegistryService);
  registry.register('hero', HeroComponent);
  registry.register('text', TextComponent);
});

// In template
<vertex-block-renderer [blocks]="page.layout" />
```

---

## How it works

### Backend bootstrap process

1. **Developer defines entities**:
   ```typescript
   // collections/article.collection.ts
   @Collection({ slug: 'articles' })
   export class Article {
     @Field({ type: FieldType.Text })
     title: string;
   }
   ```

2. **Register with VertexCoreModule**:
   ```typescript
   // app.module.ts
   VertexCoreModule.forRoot({
     mongoUri: 'mongodb://localhost:27017/cms',
     collections: [Article, Page, User]
   })
   ```

3. **On startup, SchemaDiscoveryService**:
   - Iterates through `collections` array
   - Reads `@Collection` metadata via `Reflect.getMetadata()`
   - Reads `@Field` metadata for each property
   - Resolves `blocks` (if any) to `BlockMetadata`
   - Calls `MongooseSchemaFactory.createSchema()` to build Mongoose schema
   - Registers model with MongoDB: `connection.model(slug, schema)`

4. **API is now live**:
   - `GET /api/content/articles` → lists all articles
   - `POST /api/content/articles` → creates article
   - `GET /api/vertex/config` → returns schema metadata

### Frontend integration

#### Admin panel
1. User navigates to `/admin`
2. Route resolver calls `VertexClientService.loadConfig()`
3. `AdminLayoutComponent` receives schema metadata
4. Sidebar dynamically shows all collections
5. Clicking "Articles" navigates to `/admin/collections/articles`
6. `CollectionListComponent` renders generic table
7. Forms are generated based on field types

#### Public pages
1. User visits `/blog`
2. `PublicPageComponent` queries `/api/content/pages?slug=blog`
3. Server returns:
   ```json
   {
     "title": "Blog",
     "layout": [
       { "blockType": "hero", "headline": "Welcome", "subheadline": "..." },
       { "blockType": "text", "content": "..." }
     ]
   }
   ```
4. `BlockRendererComponent` receives `layout` array
5. For each block:
   - Look up component in `VertexRegistryService`
   - Dynamically instantiate component
   - Pass block data to component's `@Input() data`

---

## Usage guide

### Understanding the two main patterns

VertexCMS supports two distinct patterns that serve different purposes:

1. **Block-Based pages**: Dynamic pages built from reusable blocks (Hero, Text, Image, etc.) - Uses `BlockRendererComponent`
2. **Data collections**: Structured data (Products, Articles, etc.) - Uses regular Angular templates

Both can be used independently or combined. Let's explore each pattern.

---

### Pattern 1: Block-Based pages

Use this pattern when you want content editors to build pages by composing blocks.

#### Backend Setup

**Define blocks**:
```typescript
// src/blocks/hero.block.ts
import { Block, Field, FieldType } from '@vertex/common';

@Block({
  slug: 'hero',
  label: 'Hero Section'
})
export class HeroBlock {
  @Field({ type: FieldType.Text, label: 'Headline' })
  headline: string;

  @Field({ type: FieldType.Text, label: 'Subheadline' })
  subheadline: string;
}
```

```typescript
// src/blocks/text.block.ts
@Block({
  slug: 'text-simple',
  label: 'Text Block'
})
export class TextBlock {
  @Field({ type: FieldType.RichText })
  content: string;
}
```

**Create page collection with blocks field**:
```typescript
// src/collections/page.collection.ts
import { Collection, Field, FieldType } from '@vertex/common';
import { HeroBlock } from '../blocks/hero.block';
import { TextBlock } from '../blocks/text.block';

@Collection({
  slug: 'pages',
  singularName: 'Page',
  timestamps: true,
  access: {
    read: ['public'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class Page {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ type: FieldType.Text, required: true, unique: true })
  slug: string;

  @Field({ 
    type: FieldType.Blocks, 
    blocks: [HeroBlock, TextBlock]  // ← This makes it block-based
  })
  layout: any[];
}
```

**Register collections**:
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex/core';
import { Page } from './collections/page.collection';

@Module({
  imports: [
    VertexCoreModule.forRoot({
      mongoUri: process.env.MONGO_URI,
      collections: [Page]
    })
  ]
})
export class AppModule {}
```

#### Frontend Setup

**Create block components**:
```typescript
// components/hero/hero.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <section class="hero">
      <h1>{{ data.headline }}</h1>
      <p>{{ data.subheadline }}</p>
    </section>
  `
})
export class HeroComponent {
  @Input() data: any; // Receives block data from CMS
}
```

```typescript
// components/text/text.component.ts
@Component({
  selector: 'app-text',
  standalone: true,
  template: `
    <div [innerHTML]="data.content"></div>
  `
})
export class TextComponent {
  @Input() data: any;
}
```

**Register Blocks in App Config**:
```typescript
// app.config.ts
import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { VertexRegistryService } from '@vertex/public';
import { HeroComponent } from './components/hero/hero.component';
import { TextComponent } from './components/text/text.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const registry = inject(VertexRegistryService);
      // Map backend block slugs to frontend components
      registry.register('hero', HeroComponent);
      registry.register('text-simple', TextComponent);
    })
  ]
};
```

**Create Page Component**:
```typescript
// pages/dynamic-page/dynamic-page.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CmsFetchService, BlockRendererComponent } from '@vertex/public';
import { map } from 'rxjs';

@Component({
  standalone: true,
  imports: [BlockRendererComponent],
  template: `
    @if (page(); as pageData) {
      <h1>{{ pageData.title }}</h1>
      <!-- This renders the block-based layout -->
      <vertex-block-renderer [blocks]="pageData.layout" />
    } @else {
      <div>Loading...</div>
    }
  `
})
export class DynamicPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cmsFetch = inject(CmsFetchService);
  
  page = signal<any>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'] || 'home';
      
      // Fetch page by slug
      this.cmsFetch.get('/api/content/pages', { slug })
        .pipe(map((res: any) => res.docs[0]))
        .subscribe(page => this.page.set(page));
    });
  }
}
```

---

### Pattern 2: Data collections

Use this pattern for structured data like products, articles, events, etc.

#### Backend setup

**Create data collection**:
```typescript
// src/collections/product.collection.ts
import { Collection, Field, FieldType } from '@vertex/common';

@Collection({
  slug: 'products',
  singularName: 'Product',
  timestamps: true,
  access: { read: ['public'], create: ['admin'] }
})
export class Product {
  @Field({ type: FieldType.Text, required: true })
  name: string;

  @Field({ type: FieldType.Number, required: true })
  price: number;

  @Field({ type: FieldType.RichText })
  description: string;

  @Field({ type: FieldType.Upload })
  image: string;
  
  @Field({ type: FieldType.Select, options: [
    { label: 'In Stock', value: 'in-stock' },
    { label: 'Out of Stock', value: 'out-of-stock' }
  ]})
  status: string;
}
```

#### Frontend setup

**Create standard Angular component** (NOT a block):
```typescript
// pages/shop/shop.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsFetchService } from '@vertex/public';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shop">
      <h1>Our Products</h1>
      
      <div class="product-grid">
        @for (product of products(); track product._id) {
          <div class="product-card">
            <img [src]="product.image" [alt]="product.name">
            <h3>{{ product.name }}</h3>
            <p [innerHTML]="product.description"></p>
            <p class="price">{{ product.price | currency }}</p>
            <span class="status">{{ product.status }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }
  `]
})
export class ShopComponent implements OnInit {
  private cmsFetch = inject(CmsFetchService);
  products = signal<any[]>([]);

  ngOnInit() {
    // Fetch products collection data
    this.cmsFetch.get('/api/content/products')
      .subscribe((res: any) => this.products.set(res.docs));
  }
}
```

**Key difference**: Notice we're NOT using `BlockRendererComponent` here. We fetch the data and render it with regular Angular templates.

---

### Pattern 3: Mixed approach (Advanced)

Combine both patterns: create blocks that fetch and display collection data.

#### Backend Setup

**Create a ProductList block**:
```typescript
// src/blocks/product-list.block.ts
@Block({
  slug: 'product-list',
  label: 'Product List'
})
export class ProductListBlock {
  @Field({ type: FieldType.Text, label: 'Section Title' })
  title: string;

  @Field({ type: FieldType.Number, label: 'Items to Display', defaultValue: 6 })
  limit: number;
}
```

**Add to Page collection**:
```typescript
@Collection({
  slug: 'pages',
  // ...
})
export class Page {
  @Field({ 
    type: FieldType.Blocks, 
    blocks: [HeroBlock, TextBlock, ProductListBlock]  // ← Include ProductListBlock
  })
  layout: any[];
}
```

#### Frontend setup

**Create ProductList block component**:
```typescript
// components/product-list/product-list.component.ts
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsFetchService } from '@vertex/public';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="product-list-block">
      <h2>{{ data.title }}</h2>
      
      <div class="products">
        @for (product of products(); track product._id) {
          <div class="product-item">
            <img [src]="product.image" [alt]="product.name">
            <h3>{{ product.name }}</h3>
            <p>{{ product.price | currency }}</p>
          </div>
        }
      </div>
    </section>
  `
})
export class ProductListBlockComponent implements OnInit {
  @Input() data: any; // Block configuration from CMS
  
  private cmsFetch = inject(CmsFetchService);
  products = signal<any[]>([]);

  ngOnInit() {
    // Fetch products based on block configuration
    this.cmsFetch.get('/api/content/products', { 
      limit: this.data.limit || 6 
    }).subscribe((res: any) => this.products.set(res.docs));
  }
}
```

**Register the block**:
```typescript
// app.config.ts
provideAppInitializer(() => {
  const registry = inject(VertexRegistryService);
  registry.register('hero', HeroComponent);
  registry.register('text-simple', TextComponent);
  registry.register('product-list', ProductListBlockComponent); // ← Register it
});
```

**Now editors can**:
1. Create a page in the admin panel
2. Add a "Product List" block to the page layout
3. Configure the block (title, limit)
4. The block component fetches products and renders them

---

### Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/vertexcms
JWT_SECRET=your-secret-key
UPLOAD_PATH=/uploads
```

---

## API reference

### REST Endpoints

All endpoints are relative to `/api`

#### Configuration
- **`GET /vertex/config`**: Returns schema metadata for all collections

#### Authentication
- **`POST /auth/register`**: Register new user
  - Body: `{ email, password }`
- **`POST /auth/login`**: Login
  - Body: `{ email, password }`
  - Returns: `{ access_token }`

#### Content (Generic CRUD)
- **`GET /content/:slug`**: List all entries
  - Query params: `page`, `limit`, `{fieldName}` (filtering)
- **`GET /content/:slug/:id`**: Get single entry
- **`POST /content/:slug`**: Create entry (requires auth)
- **`PATCH /content/:slug/:id`**: Update entry (requires auth)
- **`DELETE /content/:slug/:id`**: Delete entry (requires auth)

#### Uploads
- **`POST /vertex/upload`**: Upload file (requires auth)
  - Multipart form data with `file` field
  - Returns: `{ url, filename }`

### Decorators

#### `@Collection(options: CollectionOptions)`
Marks a class as a CMS collection.

**Options**:
- `slug` (string, required): URL-safe identifier
- `singularName` (string): Display name
- `timestamps` (boolean): Auto-add createdAt/updatedAt
- `access` (object): RBAC rules
- `hooks` (object): Lifecycle hooks

#### `@Field(options: FieldOptions)`
Marks a class property as a field.

**Options**:
- `type` (FieldType, required): Data type
- `label` (string): Display name
- `required` (boolean): Validation
- `unique` (boolean): Database constraint
- `defaultValue` (any): Initial value
- `blocks` (Function[]): For `FieldType.Blocks`

#### `@Block(options: BlockOptions)`
Marks a class as a content block.

**Options**:
- `slug` (string, required): Block identifier
- `label` (string): Display name
- `icon` (string): Icon for admin UI

---

## Advanced topics

### Hooks

Hooks allow you to execute custom logic during data lifecycle events.

**Example: Password hashing**
```typescript
import * as bcrypt from 'bcrypt';

@Collection({
  slug: 'users',
  hooks: {
    beforeChange: async ({ data, operation }) => {
      if (operation === 'create' && data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      return data;
    },
    afterRead: ({ doc }) => {
      delete doc.password; // Remove password from API responses
      return doc;
    }
  }
})
export class User {
  @Field({ type: FieldType.Email, required: true, unique: true })
  email: string;

  @Field({ type: FieldType.Text, required: true, hidden: true })
  password: string;
}
```

### Custom storage adapters

Implement the `StorageAdapter` interface to support different storage backends:

```typescript
import { StorageAdapter } from '@vertex/common';

export class S3Adapter implements StorageAdapter {
  async upload(file: Express.Multer.File): Promise<{ url: string }> {
    // Upload to S3
    return { url: 'https://s3.amazonaws.com/...' };
  }

  async delete(url: string): Promise<void> {
    // Delete from S3
  }
}

// Use in module
VertexCoreModule.forRoot({
  mongoUri: '...',
  collections: [...],
  storageAdapter: S3Adapter
})
```

### Nested blocks

Blocks can contain other blocks:

```typescript
@Block({ slug: 'section' })
export class SectionBlock {
  @Field({ type: FieldType.Text })
  title: string;

  @Field({ type: FieldType.Blocks, blocks: [TextBlock, ImageBlock] })
  children: any[];
}
```

The `BlockRendererComponent` handles recursion automatically.

### Access control

The current implementation supports simple role-based access:

```typescript
@Collection({
  slug: 'admin-only',
  access: {
    read: ['admin'],     // Only admins can read
    create: ['admin'],   // Only admins can create
    update: ['admin'],   // Only admins can update
    delete: ['admin']    // Only admins can delete
  }
})
export class SensitiveData { }
```

**Future enhancement**: Per-document permissions and custom access functions.

### SSR considerations

The `CmsFetchService` automatically handles SSR:

- **Server-side**: Uses absolute URL to backend (e.g., `http://vertex-api:3001`)
- **Client-side**: Uses relative URL (proxied by Nginx)
- **State Transfer**: Data fetched during SSR is serialized and reused on hydration

**Example docker-compose.yaml**:
```yaml
services:
  vertex-api:
    image: vertex-backend
    ports:
      - "3001:3001"
    environment:
      - MONGO_URI=mongodb://mongo:27017/cms

  vertex-client:
    image: vertex-frontend
    depends_on:
      - vertex-api
    environment:
      - API_URL=http://vertex-api:3001
```

---

## Summary

VertexCMS provides a complete, type-safe CMS solution for Angular + NestJS applications:

- **Backend**: Define schemas with decorators, automatic API generation
- **Frontend**: Dynamic admin UI, component-based rendering
- **Architecture**: Modular libraries, shared types, extensible adapters
- **Developer Experience**: Single mental model, no context switching

The playground apps in `apps/playground/` demonstrate a fully working implementation with collections, blocks, authentication, and file uploads.

---

**Next steps**: Review [ROADMAP.md](ROADMAP.md)
