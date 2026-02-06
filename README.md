# Vertex CMS

> **ATTENTION: THIS IS STILL A WORK IN PROGRESS**

## The native code-first CMS for the Angular and NestJS ecosystem.

VertexCMS is a modern, block-based content management system designed specifically for developers who have chosen the Angular + NestJS stack. It bridges the gap between "Headless" flexibility and "Visual" page building, without forcing you to leave the ecosystem you love.

## 🎯 Motivation: Why another CMS?
There are incredible Headless CMS options out there — Payload, Strapi, Prismic, Contentful. They are powerful tools, but I felt that they often treat **Angular** and **NestJS** as second-class citizens. Their documentation, SDKs, and starter kits heavily favor the React/Next.js ecosystem.

As developers, we often face a choice: adapt our workflow to a tool built for a different stack, or build something custom.

**VertexCMS exists to fill that void.**

### Built for our stack
I am not a software developer by profession; time is my most valuable resource. Maintaining proficiency in React, Vue, Next.js, and Svelte just to use a CMS is inefficient. I chose Angular and NestJS years ago for their robustness, strict typing, and shared architectural patterns (Modules, Decorators, Dependency Injection).

Since then, I have been keeping up to date on it and using this technology stack in my personal and professional projects. I am not saying that the other frameworks are not good, but at this moment I just needed a tool that fitted quickly in my workflow, and because I couldn't find one, I decided to build it.

VertexCMS allows you to stay within that single mental model:
- Backend: Define schemas using NestJS Decorators (@Collection, @Field).
- Frontend: Render content using Angular Components and Signals.
- Language: One unified TypeScript codebase, from database to DOM.

No context switching. No "React-wrapper". Just pure Angular + NestJS.

## ✨ What makes it different?
### 1. The "Code-First" experience
In VertexCMS, your code is the source of truth.

```typescript
// defined in your NestJS backend
@Collection({ slug: 'articles', access: { read: ['public'] } })
export class Article {
  @Field({ type: FieldType.Text, required: true })
  title: string;

  @Field({ 
    type: FieldType.Relationship,
    relationTo: 'authors',
    required: true
  })
  author: string;  // Single relationship

  @Field({ 
    type: FieldType.Relationship,
    relationTo: 'tags',
    relationMany: true
  })
  tags: string[];  // Many-to-many relationship

  @Field({ type: FieldType.Blocks, blocks: [HeroBlock, TextBlock] })
  content: any[];
}
```

### 2. Block-Driven design

VertexCMS is built around Blocks.

- Define a HeroBlock in your backend.
- Create a matching HeroComponent in your frontend.
- The system automatically maps JSON data to the correct Angular component at runtime.

### 3. Native Angular SSR support

Built-in support for Angular Server-Side Rendering with proper state transfer.


## 🚀 Key features
- **Dynamic admin UI**: an Angular-based Admin panel that generates itself at runtime based on your backend schemas.
- **Polymorphic forms**: manage complex, nested block structures with a clean UI.
- **Rich text editor**: integrated Tiptap WYSIWYG editor for formatted content.
- **Relationships**: define single and many-to-many relationships between collections with async searchable autocomplete UI and automatic population support.
- **Database agnostic**: support for multiple database systems (PostgreSQL, MySQL, MongoDB, etc.) though adapters (*WIP; for the moment only MongoDB is implemented*).
- **Media library**: comprehensive media management system with automatic image processing (WebP conversion, responsive variants), metadata editing (alt text, captions), search/filtering, and seamless integration with upload fields. Storage-agnostic architecture (Local filesystem implemented, extensible to S3/GCS or any custom adapter).
- **Built-in auth**: secure JWT authentication with Role-Based Access Control (RBAC). More authentication methods will be added in the future.
- **Type safety**: shared interfaces between frontend and backend ensure your CMS data matches your UI components.

## 🛠 Architecture
VertexCMS is built as a set of modular libraries within an Nx Monorepo (another must have for the Angular + NestJS stack):

- ``@vertex/core``: the NestJS engine. Handles database (MongoDB through mongoose, more planned), schema discovery, and the generic REST API.
- ``@vertex/admin``: the admin interface. A dynamic Angular app that consumes the Core API.
- ``@vertex/public``: the frontend SDK. A lightweight Angular library for rendering CMS blocks.
- ``@vertex/common``: shared decorators and interfaces.

🏁 Quick Start (Local Playground)
To see the system in action, run the included Playground app:

1. **Install dependencies:**
```sh
npm install
```

2. **Start the backend (port 3000, default for NestJS):**
```sh
npx nx serve playground-api
```

3. **Start the frontend (port 4200, default for Angular):**
```sh
npx nx serve playground-client
```

4. **Access:**
- Admin Panel: http://localhost:4200/admin
- Public Site: http://localhost:4200

## 🔮 Roadmap and planned next steps

- [WIP] **Packaging**: publishing core libraries to NPM for easy consumption.
- [ ] **CLI**: ``create-vertex-app`` for instant project scaffolding.
- [ ] **Storage adapters**: support for AWS S3, Google Cloud Storage and more.
- [ ] **Database adapters**: support for PostgreSQL, MySQL and more.
- [ ] **i18n**: native multi-language support.
- [ ] **Email support**: sending emails through NestJS and an email adapter.
- [ ] **SEO**: SEO support through Angular SSR and meta tags.
- [ ] **UI/UX**: improve the admin panel UI/UX.
- [ ] **Testing**: add tests for the core libraries.
- [WIP] **Documentation**: write documentation for the core libraries (see [ARCHITECTURE.md](ARCHITECTURE.md)).
- [WIP] **Examples**: add examples of how to use the core libraries (see [ARCHITECTURE.md](ARCHITECTURE.md)).
- [ ] **Plugins**: allow for extensibility of the system through plugins, moving the DB and Storage adapters to plugins.
- [ ] **Project website**: create a website for the project using, obiously, VertexCMS 😁.