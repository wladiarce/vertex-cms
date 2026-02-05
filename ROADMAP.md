# VertexCMS Roadmap

> **Current version**: 0.1.x (Work in Progress)  
> **Target v1.0**: H2-2026??

---

## Vision

VertexCMS aims to become the **premier content management system for the Angular + NestJS ecosystem**, providing a code-first, type-safe, and developer-friendly alternative to existing headless CMSs. Our roadmap is structured around three core phases:

1. **Alpha**: Achieve feature parity with established CMSs
2. **Beta**: Polish the developer experience and ecosystem
3. **Stable**: Production-ready hardening and official release

---

## Development phases

### Phase 1: Alpha — Core maturity (v0.2.x - v0.4.x)

**Goal**: Reach feature parity with established headless CMSs regarding content management capabilities.  
**Timeline**: 4-6 weeks

#### Milestone 1: The "Global content" update (v0.2.0)

> **Job to be done**: As a content editor, I need to manage content in multiple languages so that I can support global reach.

##### Internationalization (i18n)
- [x] **Backend**: Update Schema Engine to support `localized: true` on field definitions
- [x] **DB**: Store localized fields as objects: `{ en: "Value", es: "Valor", fr: "Valeur" }`
- [x] **API**: Add locale query parameter (e.g., `?locale=es`) to fetch content in specific language
- [x] **UI**: Add "Locale Switcher" in Admin Form that toggles visible field values
- [x] **Fallback logic**: If translation missing, fall back to default locale

##### Draft & publish system
- [x] **Versions collection**: Create a generic `_versions` collection to store document history
- [x] **Status Field**: Add `status: 'draft' | 'published' | 'archived'` to all collections
- [x] **UI**: Add "Save as Draft" vs "Publish" buttons in edit forms
- [x] **API**: Update `find()` to default to `{ status: 'published' }`, with `?draft=true` accessible only via auth
- [x] **Scheduled publishing**: (Optional) Support `publishedAt` date field for future publishing

---

#### Milestone 2: The "Relations" update (v0.3.0)

> **Job to be done**: As a developer, I need to link data types (e.g., Authors to Posts) easily and efficiently.

##### Advanced relationships
- [X] **UI**: Replace simple text ID input with **Async searchable select** component
  - Search by title/name
  - Display preview of related document
  - Support creating new related documents inline
- [X] **Backend**: Implement `populate()` DB logic in Generic API
  - Add `?populate=author,categories` query parameter
  - Support nested population up to defined depth (e.g., max 3 levels)
  - Prevent circular references
- [X] **Many-to-Many relations**: Support array-based relationships (e.g., `tags: [ObjectId]`)

##### Media library 2.0
- [ ] **Image processing**: Integrate `sharp` for automatic optimization
  - Generate thumbnails (150x150, 300x300)
  - Create responsive sizes (sm, md, lg, xl)
  - Auto-convert to WebP format
  - Preserve original
- [ ] **Media grid UI**: Dedicated "Media" page in Admin
  - Browse all uploaded files
  - Filter by type (image, video, document)
  - Search by filename
  - Bulk delete
  - Copy URLs to clipboard
- [ ] **Metadata**: Store alt text, captions, and custom metadata for media files

---

#### Milestone 3: The "Integrator" update (v0.4.0)

> **Job to be done**: As a developer, I need the CMS to talk to other systems when content changes.

##### Webhooks
- [ ] **UI**: Settings page to define Webhook URLs
  - Configure triggers: `on: ['create', 'update', 'delete']`
  - Filter by collection: `collection: 'pages'`
  - Add custom headers (e.g., `X-API-Key`)
- [ ] **Dispatch service**: POST payload to external URLs on events
  - Retry logic (3 attempts with exponential backoff)
  - Webhook logs (success/failure, timestamp, response)
- [ ] **Use cases**: Trigger Netlify/Vercel builds, sync to Algolia, notify Slack

##### API tokens
- [ ] **Token generation**: Allow creating long-lived "API Keys" for external services
- [ ] **Scopes**: Define read/write permissions per token
- [ ] **UI**: Manage tokens in Admin (create, revoke, view last used)
- [ ] **Authentication**: Support both JWT (user sessions) and API tokens (services)

---

### Phase 2: Beta — Ecosystem & DX (v0.5.x - v0.8.x)

**Goal**: Lower the barrier to entry. Make it trivial for a new developer to start and deploy.  
**Timeline**: 4-6 Weeks

#### Milestone 4: The "Cloud" update (v0.5.0)

> **Job to be done**: As a DevOps engineer, I need to deploy this without worrying about losing user uploads.

##### Storage plugins
- [ ] **@vertex/plugin-s3**: AWS S3 adapter
- [ ] **@vertex/plugin-gcs**: Google Cloud Storage adapter
- [ ] **@vertex/plugin-azure**: Azure Blob Storage adapter (community contribution)
- [ ] **Plugin System**: Refactor Core to load plugins via `forRoot({ storage: S3Adapter })`
- [ ] **Configuration**: Support environment-based config (bucket names, regions, credentials)

##### Database enhancements
- [ ] **Connection pooling**: Support advanced MongoDB connection options via ENV
- [ ] **Replica sets**: Configuration for high-availability setups
- [ ] **Other database adapters** (using TypeORM or Prisma):
  - PostgreSQL adapter
  - MySQL adapter

---

#### Milestone 5: The "CLI" update (v0.6.0)

> **Job to be done**: As a new user, I want to try VertexCMS in under 5 minutes.

##### create-vertex-app
- [ ] **Interactive CLI**: `npx create-vertex-app my-site`
- [ ] **Prompts**:
  - "Choose your frontend" (Angular SSR, Angular SPA, Admin page only)
  - "Choose your database" (MongoDB, PostgreSQL)
  - "Choose your storage" (Local, S3, GCS)
  - "Include example collections?" (Yes/No)
- [ ] **Template generation**:
  - Clone appropriate starter template
  - Install dependencies automatically
  - Initialize a local DB container (Docker Compose) - optional
  - Generate JWT secret
- [ ] **First run experience**:
  - Create default admin user or prompt DB initialization instructions if no DB container has been initialized
  - Seed example content (optional)
  - Open browser to `http://localhost:4200/admin`

##### Project scaffolding commands
- [ ] `vertex generate collection <name>`: Generate collection boilerplate
- [ ] `vertex generate block <name>`: Generate block + component boilerplate
- [ ] `vertex migrate`: Database migration tool for version upgrades

---

#### Milestone 6: The "Documentation" update (v0.7.0)

> **Job to be done**: As a developer, I need to solve problems without reading the source code.

##### Docs site (using Vertex CMS!)
- [ ] **Implementation**: Build docs site with VertexCMS itself
- [ ] **Content structure**:
  - Getting Started
  - Core Concepts (Collections, Fields, Blocks)
  - Guides: "Your first block", "Deploying to Docker", "Creating a plugin"
  - API Reference (auto-generated TypeDoc)
  - Migration guides (v0.1 → v0.2, etc.)
- [ ] **Search**: Integrate search functionality (Algolia or local)
- [ ] **Code examples**: Embed live code snippets with syntax highlighting

##### Demo playground
- [ ] **Live deployment**: Read-only Admin UI for prospective users
- [ ] **Interactive tutorial**: Step-by-step guide within the demo
- [ ] **Showcase**: Examples of different use cases (blog, e-commerce, portfolio)

---

#### Milestone 7: Email support (v0.7.5)

> **Job to be done**: As a developer, I need to send transactional emails from the CMS.

- [ ] **Email service abstraction**: Generic interface for email providers
- [ ] **Adapters**:
  - Nodemailer (SMTP)
  - SendGrid
  - AWS SES
  - Mailgun
- [ ] **Template system**: Email templates with variable interpolation
- [ ] **Use cases**: Password reset, welcome emails, notifications

---

### Phase 3: Stable — Production hardening (v0.9.x - v1.0.0)

**Goal**: Ensure the system is robust, secure, and fast enough for enterprise use.  
**Timeline**: 3-4 Weeks

#### Milestone 8: The "Security" update (v0.9.0)

> **Job to be done**: As a CTO, I need to ensure this tool won't expose my company to liabilities.

##### Security hardening
- [ ] **Rate limiting**: Implement `ThrottlerModule` in NestJS to prevent API abuse
- [ ] **CORS configuration**: Proper CORS headers for production
- [ ] **Helmet integration**: Security headers (CSP, XSS protection)
- [ ] **Input sanitization**: Ensure all HTML input (Rich Text) is sanitized server-side to prevent XSS
- [ ] **SQL injection prevention**: Parameterized queries (if using SQL adapters)
- [ ] **File upload validation**: Whitelist file types, scan for malware

##### Authentication enhancements
- [ ] **OAuth 2.0 support**: Google, GitHub, Microsoft providers
- [ ] **SSO (SAML)**: For enterprise customers
- [ ] **Two-factor authentication**: TOTP-based 2FA
- [ ] **Session management**: Revoke sessions, view active sessions

##### Testing coverage
- [ ] **Unit tests**: >80% coverage on Core services
  - ContentService
  - AuthService
  - SchemaDiscoveryService
- [ ] **Integration tests**: API endpoint testing
- [ ] **E2E tests**: Cypress tests for critical path
  - Login → Create Page → Add Block → Publish → View Public
  - File upload flow
  - Relationship creation

---

#### Milestone 9: The "Performance" update (v0.9.5)

> **Job to be done**: As a user, I expect the Admin panel to be snappy even with 10,000 documents.

##### Backend optimizations
- [ ] **Caching**: Implement `CacheModule` (Redis/InMemory)
  - Cache public API GET requests
  - Invalidate on updates
  - TTL configuration per collection
- [ ] **Database indexing**: Automatically create indexes
  - Slug fields (unique index)
  - Relationship fields
  - Timestamp fields
  - Full-text search indexes
- [ ] **Pagination improvements**: Cursor-based pagination for large datasets
- [ ] **Query optimization**: Analyze and optimize slow queries

##### Frontend optimizations
- [ ] **Lazy loading**: Optimize Angular Admin
  - Load Tiptap only when Rich Text field is used
  - Code split by routes
  - Defer non-critical resources
- [ ] **Virtual scrolling**: For large data tables
- [ ] **Image lazy loading**: In media library and content previews
- [ ] **Service worker**: Offline-first admin panel (optional)

##### SEO features
- [ ] **Meta tags**: Built-in SEO field group (title, description, OG tags)
- [ ] **Sitemap generation**: Auto-generate XML sitemaps
- [ ] **Robots.txt**: Configurable robots.txt endpoint
- [ ] **Structured data**: Schema.org JSON-LD support

---

#### 🚀 Milestone 10: v1.0.0 Launch

> **Job to be done**: Announce the stable release to the world.

##### Deliverables
- [ ] **Final NPM release**: `@vertex/core@1.0.0`, `@vertex/admin@1.0.0`, etc.
- [ ] **Announcement blog post**: "Introducing VertexCMS: The Native CMS for Angular + NestJS"
- [ ] **Product Hunt launch**: Prepare assets, demo video, landing page
- [ ] **Community setup**:
  - Discord server
  - GitHub discussions
  - Contribution guidelines
- [ ] **Marketing**:
  - Dev.to article
  - X (Twitter) announcement thread
  - Angular/NestJS community channels

---

## Immediate action items (this week)

Before starting new features, we need to establish a solid foundation:

### 1. Testing infrastructure
- [ ] Add Jest configuration for unit tests
- [ ] Write basic tests for `ContentService` (CRUD operations)
- [ ] Write basic tests for `AuthService` (login, JWT validation)
- [ ] Set up Cypress for E2E testing

### 2. Repository organization
- [ ] Create `packages/` folder structure (if not enforced by Nx)
- [ ] Separate plugins from core libraries
- [ ] Define clear package boundaries

### 3. CI/CD pipeline
- [ ] Set up **GitHub Actions** workflow
- [ ] Run `nx test` on every PR
- [ ] Run `nx lint` on every PR
- [ ] Run `nx build` to ensure buildability
- [ ] Add code coverage reporting

### 4. Code quality
- [ ] Add ESLint rules for code consistency
- [ ] Set up Prettier for formatting
- [ ] Add pre-commit hooks (Husky)
- [ ] Document coding standards

---

## Additional features (backlog)

These features are planned but not yet assigned to a specific milestone:

### Content features
- [ ] **Content revision history**: View and restore previous versions
- [ ] **Content duplication**: Clone entries with one click
- [ ] **Bulk operations**: Edit multiple entries at once
- [ ] **Content import/export**: JSON/CSV import/export
- [ ] **Content templates**: Pre-defined content structures

### Admin UI enhancements
- [ ] **Dark mode**: Theme switcher
- [ ] **Customizable dashboard**: Widget-based dashboard
- [ ] **Activity log**: Audit trail of all changes
- [ ] **User management**: Roles and permissions UI
- [ ] **Analytics dashboard**: Content usage metrics

### Developer tools
- [ ] **GraphQL API**: Alternative to REST
- [ ] **TypeScript SDK**: Type-safe client for consuming CMS
- [ ] **React renderer**: Block renderer for React (for flexibility)
- [ ] **Storybook integration**: Visual block library

### Advanced features
- [ ] **Workflow engine**: Multi-step approval workflows
- [ ] **Content scheduling**: Publish/unpublish on schedule
- [ ] **A/B testing**: Built-in variant testing
- [ ] **CDN integration**: Cloudflare/Fastly edge caching
- [ ] **Backup/restore**: Automated backup system

---

## Contributing

We welcome contributions! See our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Current priorities

If you want to contribute, we especially need help with:
- Writing tests for existing features
- Documentation improvements
- Storage adapter implementations (S3, GCS, Azure)
- UI/UX improvements for Admin panel

---

## Version history

| Version | Release Date | Highlights |
|---------|--------------|------------|
| v0.1.0  | Jan 2026     | Initial alpha release with core CMS functionality |
| v0.2.0  | TBD          | i18n and Draft/Publish system |
| v0.3.0  | TBD          | Advanced relationships and Media Library 2.0 |
| ...     | ...          | ...        |
| v1.0.0  | Q2 2026      | Stable production release |

---

## Questions or feedback?

- **GitHub issues**: [Report bugs or request features](https://github.com/wladiarce/vertex-cms/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/wladiarce/vertex-cms/discussions)
- **Email**: wladiarce@gmail.com

---

**Last updated**: January 2026
