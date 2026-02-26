import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const FEATURES = [
  { icon: '▦', label: '01 // Collections', title: 'Code-First Collections', desc: 'Define data models with TypeScript decorators. Collections auto-generate admin UI, REST APIs, and database schemas.' },
  { icon: '⊞', label: '02 // Blocks', title: 'Visual Block Builder', desc: 'Compose page layouts from reusable blocks. Drag, drop, and reorder content sections with full type safety end-to-end.' },
  { icon: '⚡', label: '03 // SSR + API', title: 'Angular SSR + NestJS', desc: 'First-class Server-Side Rendering with Angular 17. NestJS powers the REST API with JWT auth and file uploads built in.' },
  { icon: '🔌', label: '04 // Plugins', title: 'Plugin Architecture', desc: 'Swap database adapters, storage backends, and email providers via clean plugin interfaces — MongoDB, TypeORM, S3, GCS.' },
  { icon: '✦', label: '05 // Relationships', title: 'Deep Relationships', desc: 'One-to-one and many-to-many relationships with a single decorator. Auto-populated in queries and wired in the admin UI.' },
  { icon: '🌍', label: '06 // i18n', title: 'Localization Ready', desc: 'Mark any field as localized. Fetching content in the right locale is one query param away. Fallback chains automatic.' },
];

const DEMOS = [
  { title: 'Editorial Blog', desc: 'Rich text posts, categories, authors, and images — the classic headless blog powered by VertexCMS collections.', link: '/blog', tag: 'BLOG' },
  { title: 'E-Commerce Demo', desc: 'Products, categories, pricing, and image galleries — all managed from the admin panel and rendered with Angular SSR.', link: '/demo/ecommerce', tag: 'E-COMMERCE' },
  { title: 'Portfolio Demo', desc: 'Projects, galleries, clients, and tags — a complete portfolio backed by VertexCMS with rich filtering.', link: '/demo/portfolio', tag: 'PORTFOLIO' },
];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- HERO -->
    <section class="hero bg-grid-pattern">
      <div class="hero-inner">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="v-badge">v0.7.0 // BETA</span>
          <span class="font-mono text-xs" style="color:var(--text-muted)">Open Source · MIT · Angular 17 + NestJS</span>
        </div>
        <h1 class="hero-title">
          The Headless CMS<br>
          <span class="hero-accent">Built for Developers.</span>
        </h1>
        <p class="hero-sub">
          Code-first collections. Type-safe blocks. A stunning admin panel.<br class="hidden md:block">
          VertexCMS is the CMS that gets out of your way.
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a routerLink="/docs" class="v-btn primary lg">Get Started →</a>
          <a routerLink="/demo/ecommerce" class="v-btn lg">View Demos</a>
        </div>
        <div class="hero-code v-card w-full max-w-2xl">
          <div class="code-bar">
            <span class="code-bar-label font-mono">// Define a collection in TypeScript</span>
            <span class="v-badge">TYPESCRIPT</span>
          </div>
          <pre class="code-body font-mono"><span class="c-dec">&#64;Collection</span>{{"({"}}slug:<span class="c-str">'blog-posts'</span>, drafts: <span class="c-kw">true</span>{{"})"}}
<span class="c-kw">export class</span> <span class="c-type">BlogPost</span> &#123;
  <span class="c-dec">&#64;Field</span>{{"({"}} type: FieldType.Text, required:" <span class="c-kw">true</span>{{"})"}}
  title: <span class="c-type">string</span>;

  <span class="c-dec">&#64;Field</span>{{"({"}} type: FieldType.RichText {{"})"}}
  content: <span class="c-type">string</span>;

  <span class="c-dec">&#64;Field</span>{{"({"}} type: FieldType.Relationship, relationTo: "<span class="c-str">'users'</span>{{"})"}}
  author: <span class="c-type">string</span>;
{{'}'}}</pre>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="page-section" style="background:var(--bg-subtle);border-top:1px solid var(--border-dim);border-bottom:1px solid var(--border-dim)">
      <div class="section-inner">
        <div class="v-section-label">
          <div class="v-section-num">01</div>
          <span>Core Features</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for(f of features; track f.label) {
            <div class="feature-card v-card">
              <div class="feature-icon">{{ f.icon }}</div>
              <div class="feature-label font-mono">{{ f.label }}</div>
              <h3 class="feature-title">{{ f.title }}</h3>
              <p class="feature-desc">{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- DEMOS SHOWCASE -->
    <section class="page-section demos-section">
      <div class="section-inner">
        <div class="v-section-label">
          <div class="v-section-num">02</div>
          <span>Live Demos</span>
        </div>
        <h2 class="section-title">See It In Action</h2>
        <p class="section-sub">Three fully-functional demo sites — all powered by the same VertexCMS server.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a *ngFor="let d of demos" [routerLink]="d.link" class="demo-card v-card">
            <div class="mb-3"><span class="v-badge">{{ d.tag }}</span></div>
            <h3 class="demo-title">{{ d.title }}</h3>
            <p class="demo-desc">{{ d.desc }}</p>
            <div class="demo-link font-mono">Explore → {{ d.link }}</div>
          </a>
        </div>
      </div>
    </section>

    <!-- ADMIN PANEL PREVIEW -->
    <section class="page-section">
      <div class="section-inner">
        <div class="v-section-label">
          <div class="v-section-num">03</div>
          <span>Admin Panel</span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="admin-preview-text">
            <h2 class="section-title">A CMS You'll<br>Actually Enjoy.</h2>
            <p class="mb-6" style="color:var(--text-muted);line-height:1.7">The admin panel is auto-generated from your collection definitions. No configuration, no YAML — just TypeScript decorators and a stunning UI built on the Vertex Design System.</p>
            <ul class="feature-list">
              <li><span class="v-badge">✓</span>Auto-generated forms for every field type</li>
              <li><span class="v-badge">✓</span>Drag-and-drop block editor</li>
              <li><span class="v-badge">✓</span>Draft / Publish / Archive workflow</li>
              <li><span class="v-badge">✓</span>Version history &amp; restore</li>
              <li><span class="v-badge">✓</span>Media library with upload &amp; crop</li>
              <li><span class="v-badge">✓</span>Role-based access control</li>
            </ul>
            <a routerLink="/admin" class="v-btn primary" style="margin-top:1.5rem">Open Admin Panel →</a>
          </div>
          <div class="admin-preview-mockup v-card overflow-hidden">
            <div class="mockup-header">
              <span class="font-mono" style="font-size:0.75rem;color:var(--text-muted)">// Admin Panel</span>
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full" style="background:var(--primary)"></div>
                <div class="w-2.5 h-2.5 rounded-full" style="background:var(--border-dim)"></div>
                <div class="w-2.5 h-2.5 rounded-full" style="background:var(--border-dim)"></div>
              </div>
            </div>
            <div class="mockup-body">
              <div class="mockup-sidebar hidden sm:flex">
                <div class="mockup-group-label font-mono">Content</div>
                <div class="mockup-item active">📄 Pages</div>
                <div class="mockup-item">📝 Blog Posts</div>
                <div class="mockup-item">📦 Products</div>
                <div class="mockup-group-label font-mono mt-4">Media</div>
                <div class="mockup-item">🖼 Uploads</div>
              </div>
              <div class="mockup-main">
                <div class="mockup-topbar">
                  <span class="font-mono text-xs truncate">Blog Posts / New Post</span>
                  <div class="flex gap-1 flex-shrink-0">
                    <div class="mockup-btn">DRAFT</div>
                    <div class="mockup-btn primary">PUBLISH</div>
                  </div>
                </div>
                <div class="mockup-field">
                  <div class="mockup-label font-mono">TITLE</div>
                  <div class="mockup-input">Getting started with VertexCMS</div>
                </div>
                <div class="mockup-field">
                  <div class="mockup-label font-mono">SLUG</div>
                  <div class="mockup-input font-mono" style="color:var(--text-muted)">/getting-started-with-vertexcms</div>
                </div>
                <div class="mockup-block"><div class="mockup-block-header">▦ Hero Section</div></div>
                <div class="mockup-block"><div class="mockup-block-header">≡ Rich Text Block</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section bg-grid-pattern" style="border-top:2px solid var(--border)">
      <div class="cta-inner v-card">
        <span class="v-badge">Open Source · MIT License</span>
        <h2 class="cta-title">Ready to Build?</h2>
        <p class="cta-sub">Get started with VertexCMS in under 5 minutes.</p>
        <div class="cta-code v-card w-full max-w-lg">
          <pre class="font-mono">npx create-vertex-app&#64;latest my-app</pre>
        </div>
        <div class="flex flex-wrap gap-3 justify-center">
          <a routerLink="/docs" class="v-btn primary lg">Read the Docs →</a>
          <a routerLink="/admin" class="v-btn lg">Try the Admin Panel</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* HERO */
    .hero { border-bottom: 2px solid var(--border); padding: 4rem 1.5rem 3.5rem; }
    .hero-inner { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.5rem; }
    .hero-title { font-size: clamp(2rem, 6vw, 4.5rem); font-weight: 700; line-height: 1.05; letter-spacing: -0.03em; margin: 0; }
    .hero-accent { color: var(--primary); }
    .hero-sub { font-size: clamp(1rem, 2vw, 1.15rem); color: var(--text-muted); line-height: 1.65; max-width: 600px; margin: 0; }
    .hero-code { overflow: hidden; text-align: left; }
    .code-bar { background: var(--text-main); color: var(--bg-surface); padding: 0.6rem 1rem; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .code-bar-label { font-family: var(--font-mono); font-size: 0.7rem; color: #9B9B9B; }
    .code-body { margin: 0; padding: 1.25rem 1.5rem; font-size: 0.8rem; line-height: 1.7; color: var(--text-muted); background: var(--bg-input); overflow-x: auto; }
    .c-dec { color: var(--primary); }
    .c-str { color: var(--success); }
    .c-kw { color: #5C7CFA; }
    .c-type { color: #CC8800; }

    /* SHARED */
    .page-section { padding: 4rem 1.5rem; }
    .section-inner { max-width: 1280px; margin: 0 auto; }
    .section-title { font-size: clamp(1.75rem, 4vw, 3rem); font-weight: 700; letter-spacing: -0.025em; margin: 0 0 1rem; }
    .section-sub { color: var(--text-muted); font-size: 1.05rem; max-width: 600px; margin: 0 0 2.5rem; }
    .v-section-label { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
    .v-section-num { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; background: var(--text-main); color: var(--bg-app); padding: 0.2rem 0.5rem; flex-shrink: 0; }

    /* FEATURES */
    .feature-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .feature-icon { font-size: 1.5rem; }
    .feature-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); font-weight: 700; }
    .feature-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .feature-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; margin: 0; }

    /* DEMOS */
    .demos-section { border-bottom: 1px solid var(--border-dim); }
    .demo-card { padding: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem; text-decoration: none; color: var(--text-main); transition: transform 0.1s, box-shadow 0.1s; &:hover { transform: translate(-2px,-2px); box-shadow: var(--shadow-hover); } }
    .demo-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .demo-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; flex: 1; margin: 0; }
    .demo-link { font-size: 0.75rem; color: var(--primary); font-family: var(--font-mono); }

    /* ADMIN PREVIEW TEXT */
    .feature-list { list-style: none; padding: 0; margin: 0 0 0.5rem; display: flex; flex-direction: column; gap: 0.6rem; li { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; } }

    /* MOCKUP */
    .mockup-header { background: var(--text-main); color: var(--bg-surface); padding: 0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; }
    .mockup-body { display: flex; min-height: 320px; }
    .mockup-sidebar { width: 130px; background: var(--bg-input); border-right: 1px solid var(--border-dim); padding: 1rem 0; flex-shrink: 0; flex-direction: column; overflow: hidden; }
    .mockup-group-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); padding: 0.25rem 1rem; }
    .mockup-item { font-size: 0.75rem; padding: 0.45rem 1rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mockup-item.active { background: var(--bg-subtle); color: var(--primary); border-right: 2px solid var(--primary); }
    .mockup-main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
    .mockup-topbar { background: var(--bg-surface); border-bottom: 1px solid var(--border-dim); padding: 0.6rem 1rem; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .mockup-btn { font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700; padding: 0.25rem 0.5rem; border: 1px solid var(--border); background: var(--bg-subtle); flex-shrink: 0; }
    .mockup-btn.primary { background: var(--primary); color: white; border-color: var(--border); }
    .mockup-field { padding: 0.65rem 1rem; border-bottom: 1px solid var(--border-dim); }
    .mockup-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.25rem; }
    .mockup-input { font-size: 0.75rem; background: var(--bg-input); border: 1px solid var(--border-dim); padding: 0.35rem 0.6rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mockup-block { border-bottom: 1px solid var(--border-dim); }
    .mockup-block-header { padding: 0.55rem 1rem; font-size: 0.75rem; background: var(--bg-subtle); }

    /* CTA */
    .cta-section { padding: 3rem 1.5rem 5rem; }
    .cta-inner { max-width: 680px; margin: 0 auto; padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.25rem; background: var(--bg-surface); }
    .cta-title { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; letter-spacing: -0.03em; margin: 0; }
    .cta-sub { color: var(--text-muted); font-size: 1rem; margin: 0; }
    .cta-code { padding: 0.9rem 1.25rem; pre { margin: 0; font-size: 0.85rem; color: var(--text-code); overflow-x: auto; } }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class LandingPageComponent {
  features = FEATURES;
  demos = DEMOS;
}
