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

## Draft & publish system

### Overview
VertexCMS includes a comprehensive draft and publish system with automatic document versioning. Collections can enable or disable this feature as needed.

### Status field
**Automatic schema enhancement**
- When `drafts !== false` (enabled by default), collections automatically get:
  - `status` field: `'draft' | 'published' | 'archived'`
  - `publishedAt` field: Timestamp of publication

**Example:**
```typescript
@Collection({
  slug: 'blog-posts',
  drafts: true, // Default, can be omitted
  maxVersions: 10 // Keep last 10 versions (default: 5)
})
export class BlogPost {
  @Field({ type: 'text' })
  title!: string;
  // status and publishedAt added automatically
}
```

### Document versioning
**Version storage**
- Versions stored in internal `_versions` collection
- Each version contains:
  - `collectionSlug`: Source collection
  - `documentId`: Document being versioned
  - `data`: JSON snapshot of document
  - `versionNumber`: Sequential version number
  - `createdBy`: User who created the version
  - `createdAt`: Timestamp

**Versioning strategy**
- Versions created **only** when:
  1. Publishing a document for the first time
  2. Updating an already published document
- Draft updates do NOT create versions
- Configurable version limit per collection (default: 5)
- Old versions automatically deleted when limit exceeded

### API Endpoints

#### Status management
```typescript
// Publish a draft
PATCH /api/content/:slug/:id/publish

// Unpublish (revert to draft)
PATCH /api/content/:slug/:id/unpublish
```

#### Version management
```typescript
// Get all versions for a document
GET /api/content/:slug/:id/versions

// Restore a specific version
POST /api/content/:slug/:id/restore/:versionId
```

#### Filtering
```typescript
// Default: returns only published documents
GET /api/content/:slug

// Get drafts only
GET /api/content/:slug?status=draft

// Get all documents regardless of status
GET /api/content/:slug?status=all
```

### Admin UI features

**Collection EDIT page**
- Status badges (Draft/Published/Archived)
- Separate "Save as Draft" and "Publish" buttons
- "📜 History" button to view version history
- Version history sidebar with:
  - List of all versions
  - Version number, timestamp, author
  - Restore button with confirmation

**Collection LIST page**
- Status filter dropdown (Published/Draft/All)
- Status badge column in table
- Only visible when collection has drafts enabled

### Configuration

**Enable/disable drafts**
```typescript
// Drafts enabled (default)
@Collection({ slug: 'pages' })

// Drafts disabled
@Collection({ slug: 'users', drafts: false })
```

**Version Limit**
```typescript
@Collection({ 
  slug: 'articles',
  maxVersions: 20 // Keep last 20 versions
})
```

---

## Internationalization (i18n) system

### Overview
VertexCMS includes a flexible internationalization system that allows content to be managed in multiple languages. The system supports module-level configuration, field-level localization, and automatic locale fallbacks.

### Configuration

**Module-based locale configuration**
Locales are configured when initializing `VertexCoreModule.forRoot()`:

```typescript
// apps/your-app/server/src/app/app.module.ts
VertexCoreModule.forRoot({
  mongoUri: process.env.MONGO_URI,
  entities: [Page, Post, Product],
  locales: {
    default: 'en',
    supported: ['en', 'es', 'fr', 'pt'],
    names: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      pt: 'Português'
    }
  }
})
```

**Configuration properties**
- `default`: Default locale code (fallback when no locale specified)
- `supported`: Array of supported locale codes
- `names`: Display names for each locale (used in admin UI)

**Default configuration**
If no locale configuration is provided, the system uses:
```typescript
{
  default: 'en',
  supported: ['en'],
  names: { en: 'English' }
}
```

### Localized fields

**Field-level localization**
Any field can be marked as localizable using the `localized` property:

```typescript
@Collection({ slug: 'articles' })
export class Article {
  @Field({ 
    type: FieldType.Text,
    localized: true  // ← Enable localization for this field
  })
  title: string;

  @Field({ 
    type: FieldType.RichText,
    localized: true
  })
  content: string;

  @Field({ 
    type: FieldType.Email,
    // localized: false (email addresses are language-agnostic)
  })
  authorEmail: string;
}
```

**Database storage**
Localized fields are stored as objects with locale keys:

```json
{
  "_id": "...",
  "title": {
    "en": "Welcome to VertexCMS",
    "es": "Bienvenido a VertexCMS",
    "fr": "Bienvenue à VertexCMS"
  },
  "authorEmail": "admin@example.com"
}
```

**Mongoose schema**
The `MongooseSchemaFactory` automatically converts localized fields to `Schema.Types.Mixed`:

```typescript
// Automatically generated:
{
  title: { type: Schema.Types.Mixed },  // Stores { en: "...", es: "..." }
  authorEmail: { type: String }         // Normal field
}
```

### API endpoints

#### Configuration endpoint
```typescript
// Get current locale configuration
GET /api/vertex/config/locales

// Response:
{
  "default": "en",
  "supported": ["en", "es", "fr"],
  "names": {
    "en": "English",
    "es": "Español",
    "fr": "Français"
  }
}
```

#### Content retrieval with locale

**Public API (locale transformation)**
```typescript
// Default locale
GET /api/content/articles/123
// Returns: { title: "Welcome", ... } (using default locale)

// Specific locale
GET /api/content/articles/123?locale=es
// Returns: { title: "Bienvenido", ... }

// Fallback behavior: If Spanish translation missing, returns English
```

**Admin API (raw data)**
```typescript
// Admin needs full locale objects for editing
GET /api/content/articles/123?raw=true
// Returns: { title: { en: "Welcome", es: "Bienvenido" }, ... }
```

### Backend implementation

**LocaleConfigProvider**
Injectable service that manages locale configuration:

```typescript
@Injectable()
export class LocaleConfigProvider {
  constructor(
    @Optional() @Inject('LOCALE_CONFIG') config?: LocaleConfiguration
  ) {
    this.config = config || DEFAULT_LOCALE_CONFIG;
  }

  getDefaultLocale(): string { /* ... */ }
  getSupportedLocales(): string[] { /* ... */ }
  getConfig(): LocaleConfiguration { /* ... */ }
}
```

**Locale transformation**
The `ContentService.transformLocalizedFields()` method extracts locale-specific values:

```typescript
// Input (from DB):
{
  title: { en: "Hello", es: "Hola" },
  content: { en: "Content", es: "Contenido" }
}

// Output (with locale='es'):
{
  title: "Hola",
  content: "Contenido"
}
```

**Fallback logic**
```typescript
function getLocalizedValue(field: any, locale: string, defaultLocale: string) {
  if (field[locale]) return field[locale];        // 1. Use requested locale
  if (field[defaultLocale]) return field[defaultLocale];  // 2. Fall back to default
  return field[Object.keys(field)[0]] || '';      // 3. Use first available or empty
}
```

### Admin UI features

**Locale service**
Frontend service that fetches locale configuration from API:

```typescript
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private config = signal<LocaleConfiguration | null>(null);
  private currentLocale = signal<string>('en');

  constructor() {
    // Fetch config from backend on init
    this.http.get<LocaleConfiguration>('/api/vertex/config/locales')
      .subscribe(config => this.config.set(config));
  }

  getSupportedLocales() {
    return computed(() => this.config()?.supported || ['en']);
  }
}
```

**Localized field component**
Multi-tab interface for editing translations:

```html
<!-- Admin edit form -->
<vertex-localized-field [field]="titleField" [group]="form" />

<!-- Renders as: -->
<div>
  <label>Title *</label>
  
  <!-- Locale tabs -->
  <div class="locale-tabs">
    <button [class.active]="currentLocale === 'en'">English</button>
    <button [class.active]="currentLocale === 'es'">Español</button>
    <button [class.active]="currentLocale === 'fr'">Français</button>
  </div>
  
  <!-- Input for current locale -->
  <input [(ngModel)]="form.value.title[currentLocale]" />
  
  <!-- Visual indicator for missing translations -->
  <span class="missing-indicator" *ngIf="!form.value.title[locale]">⚠️</span>
</div>
```

**Form structure**
Localized fields use nested FormGroups:

```typescript
// Non-localized field
form = {
  email: FormControl('admin@example.com')
}

// Localized field
form = {
  title: FormGroup({
    en: FormControl('Welcome'),
    es: FormControl('Bienvenido'),
    fr: FormControl('')  // Empty = missing translation
  })
}
```

**Dynamic form initialization**
The `collection-edit component` uses an Angular `effect` to add locale controls when configuration loads:

```typescript
effect(() => {
  const supportedLocales = this.localeService.getSupportedLocales()();
  
  // Add missing locale controls dynamically
  localizedFields.forEach(field => {
    const localeGroup = this.form.get(field.name) as FormGroup;
    supportedLocales.forEach(locale => {
      if (!localeGroup.get(locale)) {
        localeGroup.addControl(locale, this.fb.control(''));
      }
    });
  });
});
```

### Frontend integration

**Public site locale fetching**
```typescript
// Fetch content in specific language
this.cmsFetch.get('/api/content/pages', { 
  slug: 'home',
  locale: 'es'  // Spanish version
}).subscribe(page => {
  // page.title = "Inicio" (not { en: "Home", es: "Inicio" })
});
```

**Language switcher example**
```typescript
@Component({
  template: `
    <select [(ngModel)]="selectedLocale" (change)="switchLanguage()">
      @for (locale of supportedLocales(); track locale) {
        <option [value]="locale">{{ getLocaleName(locale) }}</option>
      }
    </select>
  `
})
export class LanguageSwitcherComponent {
  localeService = inject(LocaleService);
  router = inject(Router);

  supportedLocales = this.localeService.getSupportedLocales();
  selectedLocale = this.localeService.getCurrentLocale();

  switchLanguage() {
    this.router.navigate([], {
      queryParams: { locale: this.selectedLocale() },
      queryParamsHandling: 'merge'
    });
  }
}
```

### Best practices

**When to localize**
- ✅ Localize: Titles, descriptions, body content, labels, metadata
- ❌ Don't localize: Email addresses, URLs, numeric IDs, timestamps, status codes

**Missing translations**
- Admin UI shows visual indicators (⚠️ or yellow dot) for missing translations
- Public API falls back to default locale automatically
- Empty strings are treated as missing

**SEO considerations**
```typescript
// Locale-specific URLs
/en/blog/welcome-to-vertexcms
/es/blog/bienvenido-a-vertexcms

// Or query parameter
/blog/welcome-to-vertexcms?locale=es
```
---

## Media Library 2.0

### Overview
VertexCMS includes a comprehensive media library system for managing uploads, images, videos, and documents. The system features automatic image processing, metadata management, and seamless integration with content fields.

### Key features

- **Automatic image processing**: WebP conversion and responsive variant generation
- **Metadata management**: Alt text, captions, and custom metadata for accessibility and SEO
- **Search and filtering**: Find media by filename, type (image/video/document)
- **Bulk operations**: Select and delete multiple files at once
- **Storage agnostic**: Extensible adapter pattern (currently supports local filesystem)
- **Integrated workflows**: Upload fields support both new uploads and selecting from existing media

### Image processing

**Automatic variant generation**
When an image is uploaded, the system automatically generates multiple variants optimized for different use cases:

```typescript
// Generated variants (all in WebP format):
{
  "thumbnail_150": "/uploads/filename-thumbnail-150.webp",  // 150×150 square
  "thumbnail_300": "/uploads/filename-thumbnail-300.webp",  // 300×300 square
  "sm": "/uploads/filename-sm.webp",   // 640px width
  "md": "/uploads/filename-md.webp",   // 768px width
  "lg": "/uploads/filename-lg.webp",   // 1024px width
  "xl": "/uploads/filename-xl.webp"    // 1280px width
}
```

**Image processor service**
The `ImageProcessorService` uses the `sharp` library for high-performance image manipulation:

```typescript
@Injectable()
export class ImageProcessorService {
  async processImage(inputPath: string, filename: string): Promise<ImageFormats> {
    const formats: ImageFormats = {};
    
    // Generate thumbnails (square crops)
    formats.thumbnail_150 = await this.createThumbnail(inputPath, filename, 150);
    formats.thumbnail_300 = await this.createThumbnail(inputPath, filename, 300);
    
    // Generate responsive variants (maintain aspect ratio)
    formats.sm = await this.createResponsive(inputPath, filename, 640);
    formats.md = await this.createResponsive(inputPath, filename, 768);
    formats.lg = await this.createResponsive(inputPath, filename, 1024);
    formats.xl = await this.createResponsive(inputPath, filename, 1280);
    
    return formats;
  }
}
```

**Format strategy:**
- **WebP conversion**: All variants converted to WebP for optimal file size
- **Thumbnails**: Use smart cropping to maintain focal point
- **Responsive sizes**: Maintain aspect ratio, scale to fit width
- **Quality**: 80% quality for good balance between size and visual fidelity

### Database schema

**Upload collection**
Media files are stored in a dedicated `_uploads` collection with the following schema:

```typescript
@Schema({ timestamps: true })
export class Upload {
  @Prop({ required: true })
  filename!: string;           // System-generated unique filename
  
  @Prop({ required: true })
  originalName!: string;       // Original uploaded filename
  
  @Prop({ required: true })
  url!: string;                // Primary file URL
  
  @Prop({ required: true })
  mimetype!: string;           // MIME type (image/jpeg, video/mp4, etc.)
  
  @Prop({ required: true })
  size!: number;               // File size in bytes
  
  @Prop()
  width?: number;              // Image width (if applicable)
  
  @Prop()
  height?: number;             // Image height (if applicable)
  
  @Prop()
  alt?: string;                // Alt text for accessibility
  
  @Prop()
  caption?: string;            // Image caption
  
  @Prop({ type: Object })
  formats?: ImageFormats;      // Generated variants { thumbnail_150: "...", sm: "..." }
  
  @Prop({ type: Object })
  metadata?: Record<string, any>;  // Extensible custom metadata
  
  @Prop()
  createdAt?: Date;
  
  @Prop()
  updatedAt?: Date;
}
```

### API endpoints

#### Upload media
```typescript
POST /api/vertex/media
Content-Type: multipart/form-data

// Body: FormData with 'file' field
FormData {
  file: [File object]
}

// Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "1633024800000-image.jpg",
  "originalName": "vacation-photo.jpg",
  "url": "/uploads/1633024800000-image.jpg",
  "mimetype": "image/jpeg",
  "size": 245678,
  "width": 1920,
  "height": 1080,
  "formats": {
    "thumbnail_150": "/uploads/1633024800000-image-thumbnail-150.webp",
    "thumbnail_300": "/uploads/1633024800000-image-thumbnail-300.webp",
    "sm": "/uploads/1633024800000-image-sm.webp",
    "md": "/uploads/1633024800000-image-md.webp",
    "lg": "/uploads/1633024800000-image-lg.webp",
    "xl": "/uploads/1633024800000-image-xl.webp"
  },
  "createdAt": "2023-10-01T12:00:00.000Z"
}
```

#### Get media list
```typescript
GET /api/vertex/media?page=1&limit=20&type=image&search=vacation

// Query params:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - type: Filter by MIME type prefix (image, video, document)
// - search: Search by filename (case-insensitive, partial match)

// Response:
{
  "data": [
    { /* Upload object */ },
    { /* Upload object */ }
  ],
  "page": 1,
  "limit": 20,
  "total": 45,
  "totalPages": 3
}
```

#### Get single media item
```typescript
GET /api/vertex/media/:id

// Response: Upload object
{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "1633024800000-image.jpg",
  // ... full upload object
}
```

#### Update metadata
```typescript
PATCH /api/vertex/media/:id
Content-Type: application/json

// Body:
{
  "alt": "Sunset over mountains",
  "caption": "Beautiful sunset captured during our trip to Colorado",
  "metadata": {
    "photographer": "John Doe",
    "location": "Rocky Mountains"
  }
}

// Response: Updated Upload object
```

#### Delete media
```typescript
// Single delete
DELETE /api/vertex/media/:id

// Bulk delete
DELETE /api/vertex/media
Content-Type: application/json

{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}

// Response:
{
  "success": true,
  "deletedCount": 2
}
```

### Admin UI components

#### Media library page
Full-featured media management interface accessible at `/admin/media-library`:

**Features:**
- Grid view with thumbnail previews
- Search bar for filename filtering
- Type dropdown filter (All Types, Images, Videos, Documents)
- Bulk selection with checkboxes
- Bulk delete action
- Upload new files via dropzone
- Click to view details/edit metadata
- Pagination controls

**Component structure:**
```typescript
@Component({
  selector: 'vertex-media-library',
  template: `
    <!-- Search and filters -->
    <div class="filters">
      <input [(ngModel)]="searchTerm" placeholder="Search by filename..." />
      <select [(ngModel)]="selectedType">
        <option value="">All Types</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
        <option value="document">Documents</option>
      </select>
    </div>
    
    <!-- Media grid -->
    <div class="media-grid">
      @for (item of media(); track item._id) {
        <div class="media-card" (click)="viewDetails(item)">
          <img [src]="item.formats?.thumbnail_300 || item.url" />
          <p>{{ item.originalName }}</p>
        </div>
      }
    </div>
    
    <!-- Pagination -->
    <div class="pagination">
      <button (click)="previousPage()" [disabled]="currentPage() === 1">Previous</button>
      <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
      <button (click)="nextPage()" [disabled]="currentPage() === totalPages()">Next</button>
    </div>
  `
})
export class MediaLibraryComponent { }
```

#### Media details modal
Dedicated component for viewing and editing media metadata:

**Features:**
- Large preview (original for images, icons for other types)
- Copy URL button
- Open in new tab link
- Editable metadata form (alt text, caption)
- File information display (filename, type, size, dimensions, upload date)
- Available formats list with copy buttons
- Save/Reset buttons for form

**Usage:**
```typescript
@Component({
  template: `
    @if (selectedMedia()) {
      <vertex-media-details
        [mediaItem]="selectedMedia()!"
        (close)="closeDetails()"
        (save)="saveMetadata($event)"
      />
    }
  `
})
```

#### Media picker modal
Reusable component for selecting media from the library:

**Features:**
- Grid view of all media
- Search and filter controls
- Visual selection with highlighted border
- Select button (disabled until item chosen)
- Cancel button

**Used by upload fields:**
```typescript
<vertex-media-picker
  (close)="closeMediaPicker()"
  (select)="onMediaSelected($event)"
/>
```

#### Enhanced upload field
The `UploadFieldComponent` now supports two workflows:

**1. Upload new file (original behavior)**
```html
<label class="upload-button">
  <i data-lucide="upload-cloud"></i>
  <span>Click to upload</span>
  <input type="file" (change)="onFileSelected($event)" />
</label>
```

**2. Choose from library (new)**
```html
<button (click)="openMediaPicker()">
  <i data-lucide="image"></i>
  <span>Choose from Library</span>
</button>
```

**Form integration:**
Both workflows set the same form control value (full Upload object), ensuring consistent behavior:

```typescript
// After upload
this.control?.setValue({
  _id: "...",
  url: "/uploads/...",
  filename: "...",
  // ... full Upload object
});

// After library selection
this.control?.setValue(selectedMedia); // Same structure
```

### Frontend usage

#### Using upload fields in collections
```typescript
@Collection({ slug: 'articles' })
export class Article {
  @Field({ type: FieldType.Text })
  title!: string;
  
  @Field({ type: FieldType.Upload })
  featuredImage!: any;  // Stores full Upload object
}
```

#### Accessing media in templates
```typescript
// In component
article = signal<Article | null>(null);

// In template
@if (article()) {
  <img 
    [src]="article().featuredImage.formats?.lg || article().featuredImage.url"
    [alt]="article().featuredImage.alt || article().title"
  />
}
```

#### Responsive images
Use the generated variants for responsive images:

```html
<picture>
  <source
    media="(min-width: 1024px)"
    [srcset]="image.formats.xl"
    type="image/webp"
  />
  <source
    media="(min-width: 768px)"
    [srcset]="image.formats.lg"
    type="image/webp"
  />
  <source
    media="(min-width: 640px)"
    [srcset]="image.formats.md"
    type="image/webp"
  />
  <img
    [src]="image.formats.sm || image.url"
    [alt]="image.alt"
    loading="lazy"
  />
</picture>
```

### Storage adapters

**Adapter interface**
```typescript
export interface StorageAdapter {
  uploadFile(file: Express.Multer.File): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getFilePath(filename: string): string;
}
```

**Local storage (default)**
```typescript
@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir = './uploads';
  
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = join(this.uploadDir, filename);
    await writeFile(filepath, file.buffer);
    return `/uploads/${filename}`;
  }
}
```

**Configuration**
```typescript
// In app.module.ts
VertexCoreModule.forRoot({
  // ... other config
  storageAdapter: LocalStorageAdapter  // or custom S3Adapter, GCSAdapter, etc.
})
```

### Best practices

**Accessibility**
- Always provide alt text for images used in content
- Use descriptive filenames
- Add captions for context

**Performance**
- Use appropriate variants for different screen sizes
- Implement lazy loading: `<img loading="lazy" />`
- Consider using `<picture>` for art direction

**Organization**
- Delete unused media regularly via bulk delete
- Use search to find and audit media
- Add metadata to improve searchability

**SEO**
- Fill out alt text for all content images
- Use descriptive filenames (renamed on upload)
- Leverage captions for additional context

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
