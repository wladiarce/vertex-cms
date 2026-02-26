import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsApiService, Page } from '../../services/cms-api.service';

@Component({
  selector: 'app-pages-demo-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pages-wrap">
      <div class="pages-hero bg-grid-pattern">
        <div class="pages-hero-inner">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="v-badge">Demo // Pages &amp; Blocks</span>
            <span class="font-mono" style="font-size:0.72rem;color:var(--text-muted)">Powered by VertexCMS</span>
          </div>
          <h1 class="pages-title">Pages &amp; Blocks</h1>
          <p class="pages-desc">Each page is a VertexCMS <code class="code-snippet font-mono">Page</code> document composed of typed blocks — Hero, Text, Code, Feature Grid, Pricing — all editable from the admin panel.</p>
        </div>
      </div>

      <div class="pages-body">
        <div class="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <div class="v-section-label" style="margin-bottom:0">
            <div class="v-section-num">Pages</div>
            <span>All Pages ({{ pages()?pages().length:0 }})</span>
          </div>
          <a routerLink="/admin" class="v-btn" style="font-size:0.7rem">Manage in Admin →</a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (_ of [1,2,3]; track _) {
              <div class="page-card v-card p-5 flex flex-col gap-3">
                <div class="skeleton-line" style="width:40%"></div>
                <div class="skeleton-line" style="width:80%"></div>
                <div class="skeleton-line" style="width:55%"></div>
              </div>
            }
          </div>
        }

        @if (!loading() && pages() && pages().length === 0) {
          <div class="cms-empty v-card">
            <div class="font-mono">// No pages yet</div>
            <p>Create <strong>pages</strong> in the admin panel, add some blocks (Hero, Text, Code...) and publish them to see them here.</p>
          </div>
        }

        @if (!loading() && pages() &&pages().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (p of pages(); track p._id) {
              <a [routerLink]="['/demo/pages', p.slug]" class="page-card v-card">
                <div class="page-card-header">
                  <div class="page-icon">PG</div>
                  <div class="page-block-count font-mono">{{ p.content?p.content.length:0 }} blocks</div>
                </div>
                <!-- Check if TITLE is an object locale field, then manage locale accordingly -->
                @if (p.title && typeof p.title === 'object') {
                  <!-- IMPLEMENT currentLocale() -->
                  <!-- <h3 class="page-card-title">{{ p.title[currentLocale()] }}</h3> -->
                  <h3 class="page-card-title">{{ p.title['en'] }}</h3>
                } @else {
                  <h3 class="page-card-title">{{ p.title }}</h3>
                }
                <div class="page-card-slug font-mono">/demo/pages/{{ p.slug }}</div>
                <div class="flex gap-2 flex-wrap">
                  @for (block of getBlockTypes(p); track block) {
                    <span class="v-badge">{{ block }}</span>
                  }
                </div>
                <div class="page-card-cta font-mono">View Page →</div>
              </a>
            }
          </div>
        }

        <!-- Block types reference -->
        <div class="blocks-reference">
          <div class="v-section-label mt-12 mb-6">
            <div class="v-section-num">Blocks</div>
            <span>Available Block Types</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (b of blockTypes; track b.slug) {
              <div class="block-type-card v-card">
                <div class="block-type-icon">{{ b.icon }}</div>
                <div class="block-type-slug font-mono">{{ b.slug }}</div>
                <div class="block-type-name">{{ b.name }}</div>
                <p class="block-type-desc">{{ b.desc }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pages-wrap { font-family: var(--font-ui); }
    .pages-hero { border-bottom: 2px solid var(--border); padding: 3rem 1.5rem; }
    .pages-hero-inner { max-width: 680px; display: flex; flex-direction: column; gap: 1rem; }
    .pages-title { font-size: clamp(2rem, 6vw, 4rem); font-weight: 700; letter-spacing: -0.035em; margin: 0; }
    .pages-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.65; margin: 0; }
    .pages-body { padding: 2.5rem 1.5rem; max-width: 1280px; margin: 0 auto; }
    .v-section-label { display: flex; align-items: center; gap: 0.75rem; }
    .v-section-num { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; background: var(--text-main); color: var(--bg-app); padding: 0.2rem 0.5rem; }
    /* Page cards */
    .page-card { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; text-decoration: none; color: var(--text-main); transition: transform 0.1s, box-shadow 0.1s; &:hover { transform: translate(-2px,-2px); box-shadow: var(--shadow-hover); } }
    .page-card-header { display: flex; justify-content: space-between; align-items: center; }
    .page-icon { width: 32px; height: 32px; background: var(--text-main); color: var(--bg-surface); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700; }
    .page-block-count { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .page-card-title { font-size: 1.15rem; font-weight: 700; margin: 0; }
    .page-card-slug { font-size: 0.7rem; color: var(--text-muted); }
    .page-card-cta { font-size: 0.7rem; color: var(--primary); font-weight: 700; margin-top: auto; }
    /* Block types */
    .block-type-card { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .block-type-icon { font-size: 1.5rem; }
    .block-type-slug { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); font-weight: 700; }
    .block-type-name { font-size: 0.95rem; font-weight: 700; }
    .block-type-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin: 0; }
    /* Shared */
    .skeleton-line { height: 12px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.5rem; .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; color: var(--text-muted); margin: 0; } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.12rem 0.45rem; font-family: var(--font-mono); font-size: 0.65rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); white-space: nowrap; }
    .v-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border); box-shadow: 2px 2px 0 var(--border); text-decoration: none; border-radius: 2px; transition: all 0.1s; &:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border); } }
    .code-snippet { font-family: var(--font-mono); color: var(--text-code); background: var(--bg-subtle); padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 0.85em; }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class PagesDemoHomeComponent {
  private api = inject(CmsApiService);
  pages = signal<Page[]>([]);
  loading = signal(true);

  blockTypes = [
    { slug: 'hero', name: 'Hero Section', icon: '🏔', desc: 'Full-width hero with headline, subheadline, CTA button, and background image.' },
    { slug: 'text', name: 'Text Content', icon: '¶', desc: 'Rich text block for body copy, headings, lists, and inline formatting.' },
    { slug: 'code-block', name: 'Code Block', icon: '</>', desc: 'Syntax-highlighted code with selectable language (TypeScript, HTML, Bash…).' },
    { slug: 'feature-grid', name: 'Feature Grid', icon: '▦', desc: 'Grid of features for marketing pages.' },
    { slug: 'pricing', name: 'Pricing Section', icon: '$', desc: 'Pricing cards with title and description.' },
    { slug: 'image', name: 'Image', icon: '🖼', desc: 'Full-width or inline image block from media library.' },
    { slug: 'product-card', name: 'Product Card', icon: '📦', desc: 'Embedded product from the products collection.' },
    { slug: 'project-gallery', name: 'Project Gallery', icon: '🖼', desc: 'Image gallery for project showcase pages.' },
  ];

  constructor() {
    this.api.listPages().subscribe({
      next: p => { this.pages.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getBlockTypes(page: Page): string[] {
    if (!page.content?.length) return [];
    const types = [...new Set(page.content.map((b: any) => b.blockType ?? b._type ?? 'block'))];
    return types.slice(0, 4);
  }
}
