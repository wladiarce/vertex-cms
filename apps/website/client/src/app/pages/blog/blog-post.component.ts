import { Component, inject, signal, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsApiService, BlogPost } from '../../services/cms-api.service';

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? '');
  }
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <div class="post-wrap">
      <div class="post-topbar">
        <nav class="v-breadcrumb min-w-0">
          <a routerLink="/blog" class="flex-shrink-0">Blog</a>
          <span class="flex-shrink-0">/</span>
          <span class="v-breadcrumb-current truncate">{{ slug }}</span>
        </nav>
        <a routerLink="/blog" class="v-btn flex-shrink-0">← All Posts</a>
      </div>

      @if (loading()) {
        <div class="post-article">
          <div class="flex flex-col gap-4">
            <div class="skeleton-line" style="width:15%"></div>
            <div class="skeleton-line" style="width:75%; height:36px"></div>
            <div class="skeleton-line" style="width:55%"></div>
            <div class="skeleton-line mt-4"></div>
            <div class="skeleton-line" style="width:90%"></div>
            <div class="skeleton-line" style="width:80%"></div>
          </div>
        </div>
      }

      @if (!loading() && !post()) {
        <div class="post-article">
          <div class="cms-empty v-card">
            <div class="font-mono">// Post not found</div>
            <p>No published blog post with slug <code class="code-snippet font-mono">{{ slug }}</code> found.</p>
            <a routerLink="/blog" class="v-btn" style="margin-top:0.5rem;width:fit-content">← Back to Blog</a>
          </div>
        </div>
      }

      @if (!loading() && post(); as p) {
        <article class="post-article">
          <header class="post-header">
            <div class="flex items-center gap-3 flex-wrap">
              @if (p.categories?.[0]) {
                <span class="v-badge">{{ p.categories?.[0]?.name }}</span>
              }
              <span class="font-mono post-read-time">
                {{ p.publishedAt ? (p.publishedAt | date:'MMM d, yyyy') : '' }}
              </span>
            </div>
            <h1 class="post-title">{{ p.title }}</h1>
            @if (p.excerpt) {
              <p class="post-lead">{{ p.excerpt }}</p>
            }
            @if (p.author) {
              <div class="flex items-center gap-3">
                <div class="byline-avatar">{{ p.author.email.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="byline-name">{{ p.author.email }}</div>
                  <div class="byline-role font-mono">// Author</div>
                </div>
              </div>
            }
          </header>

          <div class="post-divider"></div>

          <div class="post-content">
            <!-- Render rich text content as HTML -->
            @if (p.content) {
              <div class="rich-text" [innerHTML]="p.content | safeHtml"></div>
            } @else {
              <div class="cms-empty v-card">
                <p>This post has no content yet. Add a <strong>content</strong> field in the admin panel.</p>
              </div>
            }
          </div>
        </article>
      }
    </div>
  `,
  styles: [`
    .post-wrap { font-family: var(--font-ui); }
    .post-topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-dim); background: var(--bg-surface); }
    .v-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-muted); a { color: var(--text-muted); text-decoration: none; &:hover { color: var(--primary); } } }
    .v-breadcrumb-current { color: var(--text-main); font-weight: 600; }
    .post-article { max-width: 760px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .post-header { display: flex; flex-direction: column; gap: 1.1rem; }
    .post-read-time { font-size: 0.72rem; color: var(--text-muted); }
    .post-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 700; letter-spacing: -0.03em; margin: 0; line-height: 1.1; }
    .post-lead { font-size: 1.05rem; color: var(--text-muted); line-height: 1.65; margin: 0; }
    .byline-avatar { width: 34px; height: 34px; background: var(--text-main); color: var(--bg-surface); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; border-radius: 50%; flex-shrink: 0; }
    .byline-name { font-weight: 600; font-size: 0.875rem; }
    .byline-role { font-size: 0.72rem; color: var(--text-muted); }
    .post-divider { height: 2px; background: var(--border); margin: 2rem 0; }
    .post-content { display: flex; flex-direction: column; gap: 1.5rem; }
    /* Rich text styles — ::ng-deep required for [innerHTML] content */
    :host ::ng-deep .rich-text { font-size: 1rem; line-height: 1.75; color: var(--text-main);
      h1,h2,h3,h4 { margin: 1.5em 0 0.5em; font-weight: 700; letter-spacing: -0.02em; }
      h2 { font-size: 1.5rem; border-bottom: 2px solid var(--border-dim); padding-bottom: 0.5rem; }
      h3 { font-size: 1.2rem; }
      p { margin: 0 0 1em; }
      code { font-family: var(--font-mono); font-size: 0.875em; background: var(--bg-subtle); padding: 0.1rem 0.3rem; border-radius: 2px; color: var(--text-code); }
      pre { background: var(--text-main); color: #e0e0e0; padding: 1.25rem; border-radius: var(--radius); overflow-x: auto; font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.6; margin: 1.5rem 0; }
      ul,ol { padding-left: 1.5rem; margin-bottom: 1em; li { margin-bottom: 0.4rem; p { margin: 0; } } }
      blockquote { border-left: 3px solid var(--primary); padding-left: 1rem; margin: 1.5rem 0; color: var(--text-muted); font-style: italic; }
      a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
    }
    .skeleton-line { height: 14px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; color: var(--text-muted); .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; margin: 0; } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
    .v-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border); box-shadow: 2px 2px 0 var(--border); text-decoration: none; border-radius: 2px; transition: all 0.1s; &:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border); } }
    .code-snippet { font-family: var(--font-mono); color: var(--text-code); background: var(--bg-subtle); padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 0.85em; }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class BlogPostComponent {
  private api = inject(CmsApiService);
  private route = inject(ActivatedRoute);
  slug = this.route.snapshot.paramMap.get('slug') ?? '';
  post = signal<BlogPost | null>(null);
  loading = signal(true);

  constructor() {
    this.api.getBlogPost(this.slug).subscribe({
      next: p => { this.post.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
