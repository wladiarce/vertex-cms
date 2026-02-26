import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsApiService, BlogPost } from '../../services/cms-api.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="blog-wrap">
      <div class="blog-header bg-grid-pattern">
        <div class="blog-header-inner">
          <span class="v-badge">Blog</span>
          <h1 class="blog-title">VertexCMS Blog</h1>
          <p class="blog-sub">News, tutorials, and engineering updates from the VertexCMS team.</p>
        </div>
      </div>

      <div class="blog-body">
        <div class="v-section-label" style="margin-bottom:2rem">
          <div class="v-section-num">Latest</div>
          <span>All Articles</span>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (_ of [1,2,3]; track _) {
              <div class="post-card v-card skeleton-card">
                <div class="skeleton-img"></div>
                <div class="p-5 flex flex-col gap-3">
                  <div class="skeleton-line" style="width:40%"></div>
                  <div class="skeleton-line" style="width:85%"></div>
                  <div class="skeleton-line" style="width:65%"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Error -->
        @if (error()) {
          <div class="cms-error v-card">
            <span class="font-mono">// API Error</span>
            <p>{{ error() }}</p>
            <p class="font-mono text-xs">Make sure the server is running and the <code>blog-posts</code> collection has published documents.</p>
          </div>
        }

        <!-- Posts -->
        @if (!loading() && !error()) {
          @if (posts().length === 0) {
            <div class="cms-empty v-card">
              <div class="font-mono">// No posts yet</div>
              <p>Create some <strong>blog-posts</strong> in the admin panel and publish them.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (post of posts(); track post._id) {
                <article class="post-card v-card">
                  <div class="post-image-placeholder">
                    <div class="post-image-num font-mono">
                      {{ (post.categories?.[0]?.name ?? 'POST').substring(0, 3).toUpperCase() }}
                    </div>
                  </div>
                  <div class="post-body">
                    <div class="flex justify-between items-center flex-wrap gap-1">
                      @if (post.categories?.[0]) {
                        <span class="post-category font-mono">{{ post.categories?.[0]?.name }}</span>
                      } @else {
                        <span class="post-category font-mono">General</span>
                      }
                      <span class="post-time font-mono">
                        {{ post.publishedAt ? (post.publishedAt | date:'MMM d, yyyy') : '' }}
                      </span>
                    </div>
                    <h2 class="post-title">
                      <a [routerLink]="['/blog', post.slug]">{{ post.title }}</a>
                    </h2>
                    <p class="post-excerpt">{{ post.excerpt }}</p>
                    <div class="post-author font-mono">
                      <div class="author-avatar">
                        {{ (post.author?.email ?? 'A').charAt(0).toUpperCase() }}
                      </div>
                      <span>{{ post.author?.email ?? 'Author' }}</span>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .blog-wrap { font-family: var(--font-ui); }
    .blog-header { border-bottom: 2px solid var(--border); padding: 3rem 1.5rem; }
    .blog-header-inner { max-width: 640px; display: flex; flex-direction: column; gap: 1rem; }
    .blog-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; letter-spacing: -0.03em; margin: 0; }
    .blog-sub { font-size: 1rem; color: var(--text-muted); line-height: 1.6; margin: 0; }
    .blog-body { padding: 2.5rem 1.5rem; max-width: 1280px; margin: 0 auto; }
    .v-section-label { display: flex; align-items: center; gap: 0.75rem; }
    .v-section-num { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; background: var(--text-main); color: var(--bg-app); padding: 0.2rem 0.5rem; }
    .post-card { display: flex; flex-direction: column; overflow: hidden; transition: transform 0.1s, box-shadow 0.1s; &:hover { transform: translate(-2px,-2px); box-shadow: var(--shadow-hover); } }
    .post-image-placeholder { background: var(--bg-subtle); height: 140px; border-bottom: 1px solid var(--border-dim); display: flex; align-items: center; justify-content: center; }
    .post-image-num { font-size: 2.5rem; font-weight: 700; color: var(--border-dim); letter-spacing: -0.05em; }
    .post-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem; flex: 1; }
    .post-category { font-size: 0.68rem; text-transform: uppercase; font-weight: 700; color: var(--primary); letter-spacing: 0.08em; }
    .post-time { font-size: 0.68rem; color: var(--text-muted); }
    .post-title { font-size: 1.1rem; font-weight: 700; margin: 0; line-height: 1.3; a { color: var(--text-main); text-decoration: none; transition: color 0.15s; &:hover { color: var(--primary); } } }
    .post-excerpt { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; margin: 0; flex: 1; }
    .post-author { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); margin-top: auto; }
    .author-avatar { width: 20px; height: 20px; background: var(--text-main); color: var(--bg-surface); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; border-radius: 50%; flex-shrink: 0; }
    /* Skeleton */
    .skeleton-card { overflow: hidden; }
    .skeleton-img { height: 140px; background: var(--bg-subtle); }
    .skeleton-line { height: 12px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    /* Error/Empty */
    .cms-error, .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; color: var(--text-muted); .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; margin: 0; } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class BlogListComponent {
  private api = inject(CmsApiService);
  posts = signal<BlogPost[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.api.listBlogPosts().subscribe({
      next: posts => { this.posts.set(posts); this.loading.set(false); },
      error: e => { this.error.set(e?.message ?? 'Failed to load posts'); this.loading.set(false); }
    });
  }
}
