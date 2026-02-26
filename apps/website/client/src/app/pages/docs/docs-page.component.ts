import { Component, inject, Pipe, PipeTransform, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsApiService, DocPage } from '../../services/cms-api.service';

@Pipe({ name: 'titleCase', standalone: true })
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? '');
  }
}

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe, SafeHtmlPipe],
  template: `
    <div class="doc-page">
      <!-- Topbar -->
      <div class="doc-topbar">
        <nav class="v-breadcrumb min-w-0">
          <a routerLink="/docs" class="flex-shrink-0">Docs</a>
          <span class="flex-shrink-0">/</span>
          <span class="v-breadcrumb-current font-mono flex-shrink-0">{{ category() }}</span>
          <span class="flex-shrink-0">/</span>
          <span class="v-breadcrumb-current truncate">{{ slug() | titleCase }}</span>
        </nav>
        <span class="v-badge">{{ category() }}</span>
      </div>

      @if (loading()) {
        <div class="doc-article">
          <div class="flex flex-col gap-4">
            <div class="skeleton-line" style="width:15%"></div>
            <div class="skeleton-line" style="width:65%;height:36px"></div>
            <div class="skeleton-line" style="width:80%"></div>
            <div class="skeleton-line mt-4"></div>
            <div class="skeleton-line" style="width:90%"></div>
            <div class="skeleton-line" style="width:75%"></div>
          </div>
        </div>
      }

      @if (!loading() && !page() && !error()) {
        <div class="doc-article">
          <div class="doc-not-found v-card">
            <div class="font-mono">// Page not found in DB</div>
            <p>No doc page with slug <code class="code-snippet font-mono">{{ slug() }}</code> in category <code class="code-snippet font-mono">{{ category() }}</code>.</p>
            <p class="text-xs">Create it in the admin panel under the <strong>Doc Pages</strong> collection.</p>
            <a routerLink="/docs" class="v-btn" style="width:fit-content;margin-top:0.5rem">← Docs Home</a>
          </div>
        </div>
      }

      @if (!loading() && page(); as p) {
        <article class="doc-article">
          <header class="doc-article-header">
            <div class="doc-label font-mono">// {{ p.category }}</div>
            <h1 class="doc-title">{{ p.title }}</h1>
            @if (p.description) {
              <p class="doc-description">{{ p.description }}</p>
            }
          </header>

          <div class="doc-body">
            @if (p.content) {
              <div class="rich-text" [innerHTML]="p.content | safeHtml"></div>
            }
          </div>
        </article>

        <div class="doc-nav-footer">
          <a routerLink="/docs" class="v-btn">← Back to Docs</a>
        </div>
      }

      @if (error()) {
        <div class="doc-article">
          <div class="doc-not-found v-card">
            <div class="font-mono">// Error loading page</div>
            <p>{{ error() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .doc-page { display: flex; flex-direction: column; min-height: 100%; font-family: var(--font-ui); }
    .doc-topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-dim); background: var(--bg-surface); flex-wrap: wrap; }
    .v-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-muted); min-width: 0; a { color: var(--text-muted); text-decoration: none; &:hover { color: var(--primary); } } }
    .v-breadcrumb-current { color: var(--text-main); font-weight: 600; }
    .doc-article { flex: 1; padding: 2.5rem 1.5rem; max-width: 780px; }
    .doc-article-header { margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 2px solid var(--border-dim); }
    .doc-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); margin-bottom: 0.5rem; font-weight: 700; font-family: var(--font-mono); }
    .doc-title { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 1rem; }
    .doc-description { font-size: 1.05rem; color: var(--text-muted); line-height: 1.65; margin: 0; }
    .doc-body { display: flex; flex-direction: column; gap: 1.5rem; }

    /* ── Rich text prose styles ─────────────────────────────────────────────
       Must use ::ng-deep because content is rendered via [innerHTML] — those
       elements are created at runtime and don't receive Angular's scoping
       attribute, so nested selectors won't match without piercing encapsulation.
    ─────────────────────────────────────────────────────────────────────── */
    :host ::ng-deep .rich-text {
      font-size: 1rem;
      line-height: 1.8;
      color: var(--text-main);

      h1 {
        font-size: 1.9rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 2em 0 0.6em;
        &:first-child { margin-top: 0; }
      }
      h2 {
        font-size: 1.4rem;
        font-weight: 700;
        margin: 2em 0 0.6em;
        padding-bottom: 0.4rem;
        border-bottom: 2px solid var(--border-dim);
        &:first-child { margin-top: 0; }
      }
      h3 {
        font-size: 1.15rem;
        font-weight: 700;
        margin: 1.75em 0 0.4em;
        color: var(--text-main);
      }
      h4 {
        font-size: 1rem;
        font-weight: 700;
        margin: 1.5em 0 0.3em;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      p {
        margin: 0 0 1.1em;
      }

      /* Inline code */
      code {
        font-family: var(--font-mono);
        font-size: 0.875em;
        background: var(--bg-subtle);
        border: 1px solid var(--border-dim);
        padding: 0.1rem 0.35rem;
        border-radius: 2px;
        color: var(--primary);
        white-space: nowrap;
      }

      /* Code blocks */
      pre {
        background: var(--text-main);
        color: #e0e0e0;
        padding: 1.25rem 1.5rem;
        border-radius: var(--radius);
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        line-height: 1.65;
        margin: 1.5rem 0;
        border: 1px solid var(--border);
        box-shadow: 4px 4px 0 var(--border);
        white-space: pre;       /* preserve \n and spacing */

        code {
          background: transparent;
          border: none;
          color: inherit;
          padding: 0;
          font-size: inherit;
          white-space: inherit;
        }
      }

      ul {
        list-style: none;
        padding-left: 0;
        margin: 0 0 1.25em;

        li {
          padding-left: 1.4em;
          position: relative;
          margin-bottom: 0.45rem;

          /* Tiptap wraps li content in <p> — neutralise its margin */
          p { margin: 0; }

          &::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--primary);
            font-family: var(--font-mono);
            font-size: 0.8em;
            top: 0.1em;
          }
        }
      }

      ol {
        padding-left: 1.75rem;
        margin: 0 0 1.25em;
        counter-reset: ol-counter;
        list-style: none;

        li {
          counter-increment: ol-counter;
          margin-bottom: 0.5rem;
          position: relative;
          padding-left: 0.4em;

          /* Tiptap wraps li content in <p> — neutralise its margin */
          p { margin: 0; }

          &::before {
            content: counter(ol-counter) '.';
            position: absolute;
            left: -1.75rem;
            color: var(--primary);
            font-family: var(--font-mono);
            font-size: 0.85em;
            font-weight: 700;
          }
        }
      }

      blockquote {
        border-left: 3px solid var(--primary);
        margin: 1.75rem 0;
        padding: 0.75rem 1.25rem;
        background: color-mix(in srgb, var(--primary) 5%, var(--bg-surface));
        color: var(--text-muted);
        font-style: italic;
        border-radius: 0 var(--radius) var(--radius) 0;

        p { margin: 0; }
      }

      a {
        color: var(--primary);
        text-decoration: underline;
        text-underline-offset: 3px;
        font-weight: 500;
        &:hover { opacity: 0.8; }
      }

      strong { font-weight: 700; color: var(--text-main); }
      em { font-style: italic; }

      hr {
        border: none;
        border-top: 2px solid var(--border-dim);
        margin: 2.5rem 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        font-size: 0.9rem;

        th, td {
          padding: 0.6rem 0.9rem;
          border: 1px solid var(--border-dim);
          text-align: left;
        }
        th {
          background: var(--bg-subtle);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
          color: var(--text-muted);
        }
        tr:nth-child(even) td { background: var(--bg-subtle); }
      }

      img {
        max-width: 100%;
        border: 1px solid var(--border-dim);
        border-radius: var(--radius);
        display: block;
        margin: 1.5rem 0;
      }
    }

    /* ── Page chrome ─────────────────────────────────────────────────────── */
    .doc-nav-footer { padding: 1.5rem; border-top: 1px solid var(--border-dim); }
    .doc-not-found { padding: 1.75rem; display: flex; flex-direction: column; gap: 0.6rem; .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.875rem; color: var(--text-muted); margin: 0; } }
    .skeleton-line { height: 14px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); white-space: nowrap; }
    .v-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border); box-shadow: 2px 2px 0 var(--border); text-decoration: none; border-radius: 2px; transition: all 0.1s; &:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border); } }
    .code-snippet { font-family: var(--font-mono); color: var(--primary); background: var(--bg-subtle); padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 0.85em; border: 1px solid var(--border-dim); }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class DocsPageComponent {
  private api = inject(CmsApiService);
  private route = inject(ActivatedRoute);

  // Signals driven by paramMap — updated on every navigation, not just init
  category = signal('');
  slug = signal('');
  page = signal<DocPage | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    // Subscribe to paramMap so sidebar navigation (same component, new params)
    // triggers a fresh API call instead of showing stale content.
    this.route.paramMap.subscribe(params => {
      const cat = params.get('category') ?? '';
      const sl  = params.get('slug') ?? '';
      this.category.set(cat);
      this.slug.set(sl);

      // Reset state on each navigation
      this.page.set(null);
      this.loading.set(true);
      this.error.set(null);

      this.api.getDocPage(cat, sl).subscribe({
        next:  p => { this.page.set(p);                         this.loading.set(false); },
        error: e => { this.error.set(e?.message ?? 'API error'); this.loading.set(false); },
      });
    });
  }
}
