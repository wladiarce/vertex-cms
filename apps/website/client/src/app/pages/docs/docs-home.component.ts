import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-docs-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="docs-home">
      <!-- Hero -->
      <div class="docs-hero bg-grid-pattern">
        <div class="docs-hero-inner">
          <span class="v-badge">Documentation</span>
          <h1 class="docs-hero-title">VertexCMS Docs</h1>
          <p class="docs-hero-sub">Everything you need to build, deploy, and extend a VertexCMS-powered application.</p>
        </div>
      </div>

      <!-- Cards grid: 1 col mobile, 2 col sm+  -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 sm:p-6 lg:p-8">
        <a routerLink="/docs/getting-started/installation" class="doc-card v-card">
          <div class="doc-card-num font-mono">01</div>
          <h3>Getting Started</h3>
          <p>Install VertexCMS and spin up your first project in under 5 minutes.</p>
          <span class="doc-link font-mono">Start here →</span>
        </a>
        <a routerLink="/docs/core-concepts/collections" class="doc-card v-card">
          <div class="doc-card-num font-mono">02</div>
          <h3>Core Concepts</h3>
          <p>Learn about Collections, Fields, Blocks, and how they work together.</p>
          <span class="doc-link font-mono">Read →</span>
        </a>
        <a routerLink="/docs/api-reference/rest" class="doc-card v-card">
          <div class="doc-card-num font-mono">03</div>
          <h3>API Reference</h3>
          <p>Full reference for REST endpoints, query parameters, and auth headers.</p>
          <span class="doc-link font-mono">Explore →</span>
        </a>
        <a routerLink="/docs/guides/plugins" class="doc-card v-card">
          <div class="doc-card-num font-mono">04</div>
          <h3>Guides</h3>
          <p>Detailed guides on plugins, auth, media uploads, webhooks, and more.</p>
          <span class="doc-link font-mono">Browse →</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .docs-home { font-family: var(--font-ui); }
    .docs-hero { border-bottom: 1px solid var(--border-dim); padding: 3rem 1.5rem; }
    .docs-hero-inner { max-width: 640px; display: flex; flex-direction: column; gap: 1rem; }
    .docs-hero-title { font-size: clamp(1.75rem, 5vw, 3rem); font-weight: 700; letter-spacing: -0.03em; margin: 0; }
    .docs-hero-sub { color: var(--text-muted); font-size: 1rem; line-height: 1.65; margin: 0; }

    .doc-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.6rem; text-decoration: none; color: var(--text-main); transition: transform 0.1s, box-shadow 0.1s; &:hover { transform: translate(-2px,-2px); box-shadow: var(--shadow-hover); } }
    .doc-card-num { font-size: 0.68rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; }
    .doc-card h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
    .doc-card p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.55; flex: 1; margin: 0; }
    .doc-link { font-size: 0.72rem; color: var(--primary); font-family: var(--font-mono); }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class DocsHomeComponent {}
