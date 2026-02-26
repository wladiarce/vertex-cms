import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CmsApiService, Project } from '../../services/cms-api.service';

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="project-wrap">
      <div class="project-topbar">
        <nav class="v-breadcrumb min-w-0">
          <a routerLink="/demo/portfolio" class="flex-shrink-0">Portfolio</a>
          <span class="flex-shrink-0">/</span>
          <span class="v-breadcrumb-current truncate">{{ slug }}</span>
        </nav>
        <a routerLink="/demo/portfolio" class="v-btn flex-shrink-0">← All Projects</a>
      </div>

      @if (loading()) {
        <div class="p-8 max-w-xl">
          <div class="flex flex-col gap-4">
            <div class="skeleton-line" style="width:15%"></div>
            <div class="skeleton-line" style="width:65%;height:48px"></div>
          </div>
        </div>
      }

      @if (!loading() && !project()) {
        <div class="p-8 max-w-xl">
          <div class="cms-empty v-card">
            <div class="font-mono">// Project not found</div>
            <p>No published project with slug <code class="code-snippet font-mono">{{ slug }}</code>.</p>
          </div>
        </div>
      }

      @if (!loading() && project(); as p) {
        <header class="project-header bg-grid-pattern">
          <div class="project-header-inner">
            <div class="flex items-center gap-3 flex-wrap">
              @for (cat of (p.categories ?? []); track cat._id) {
                <span class="v-badge">{{ cat.name }}</span>
              }
            </div>
            <h1 class="project-title">{{ p.title }}</h1>
            <div class="project-info-row">
              @if (p.client) {
                <div class="info-block">
                  <div class="info-label font-mono">CLIENT</div>
                  <div class="info-value">{{ p.client }}</div>
                </div>
              }
              @if (p.tags?.length) {
                <div class="info-block">
                  <div class="info-label font-mono">TAGS</div>
                  <div class="info-value">{{ p.tags!.join(', ') }}</div>
                </div>
              }
              <div class="info-block">
                <div class="info-label font-mono">STATUS</div>
                <div class="info-value"><span class="v-badge status-pub">LIVE</span></div>
              </div>
            </div>
          </div>
        </header>

        <!-- Hero -->
        <div class="project-hero-image">
          <div class="image-placeholder large">
            <span class="font-mono placeholder-label">HERO // {{ p.title.toUpperCase() }}</span>
          </div>
        </div>

        <!-- Body -->
        <div class="project-body">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div class="project-text">
              <div class="v-section-label mb-5">
                <div class="v-section-num">01</div>
                <span>About the Project</span>
              </div>
              @if (p.description) {
                <div class="rich-text" [innerHTML]="p.description"></div>
              }
              <div class="cms-note v-card mt-6">
                <div class="cms-note-header font-mono">// VertexCMS Data</div>
                <div>
                  <div class="data-row"><span class="font-mono data-key">title</span><span>{{ p.title }}</span></div>
                  @if (p.client) {
                    <div class="data-row"><span class="font-mono data-key">client</span><span>{{ p.client }}</span></div>
                  }
                  <div class="data-row"><span class="font-mono data-key">slug</span><span class="font-mono">{{ p.slug }}</span></div>
                  <div class="data-row"><span class="font-mono data-key">status</span><span class="v-badge status-pub">PUBLISHED</span></div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-4">
              <div class="image-placeholder medium"><span class="font-mono placeholder-label">IMG // 01</span></div>
              <div class="image-placeholder medium"><span class="font-mono placeholder-label">IMG // 02</span></div>
            </div>
          </div>
        </div>

        <div class="project-footer-cta">
          <a routerLink="/demo/portfolio" class="v-btn">← Back to Portfolio</a>
          <a routerLink="/admin" class="v-btn primary">Manage in Admin →</a>
        </div>
      }
    </article>
  `,
  styles: [`
    .project-wrap { font-family: var(--font-ui); }
    .project-topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-dim); background: var(--bg-surface); }
    .v-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-muted); a { color: var(--text-muted); text-decoration: none; &:hover { color: var(--primary); } } }
    .v-breadcrumb-current { color: var(--text-main); font-weight: 600; }
    .project-header { border-bottom: 2px solid var(--border); padding: 3rem 1.5rem 2.5rem; }
    .project-header-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }
    .project-title { font-size: clamp(2.25rem, 7vw, 5.5rem); font-weight: 700; line-height: 0.95; letter-spacing: -0.04em; margin: 0; word-break: break-word; }
    .project-info-row { display: flex; gap: 2rem; flex-wrap: wrap; border-top: 1px solid var(--border-dim); padding-top: 1.25rem; }
    .info-block { display: flex; flex-direction: column; gap: 0.3rem; min-width: 100px; }
    .info-label { font-family: var(--font-mono); font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; }
    .info-value { font-size: 0.9rem; font-weight: 500; }
    .project-hero-image { border-bottom: 1px solid var(--border-dim); }
    .image-placeholder { background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; }
    .image-placeholder.large { height: clamp(200px, 35vw, 440px); }
    .image-placeholder.medium { height: clamp(160px, 22vw, 260px); width: 100%; }
    .placeholder-label { font-size: 0.72rem; color: var(--border-dim); letter-spacing: 0.15em; text-transform: uppercase; font-family: var(--font-mono); }
    .project-body { padding: 2.5rem 1.5rem; max-width: 1200px; margin: 0 auto; }
    .v-section-label { display: flex; align-items: center; gap: 0.75rem; }
    .v-section-num { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; background: var(--text-main); color: var(--bg-app); padding: 0.2rem 0.5rem; flex-shrink: 0; }
    .rich-text { font-size: 0.95rem; color: var(--text-muted); line-height: 1.7; p { margin: 0 0 1em; } h2 { font-size: 1.25rem; font-weight: 700; margin: 1.5em 0 0.5em; } }
    .cms-note { overflow: hidden; }
    .cms-note-header { background: var(--text-main); color: var(--bg-surface); padding: 0.55rem 1rem; font-size: 0.7rem; font-family: var(--font-mono); }
    .data-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-dim); font-size: 0.85rem; &:last-child { border-bottom: none; } }
    .data-key { font-size: 0.72rem; color: var(--text-muted); flex-shrink: 0; }
    .status-pub { background: #e6fffa; color: #047857; border-color: #047857; }
    .project-footer-cta { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding: 1.5rem; border-top: 1px solid var(--border-dim); background: var(--bg-subtle); }
    .skeleton-line { height: 14px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.5rem; .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; color: var(--text-muted); margin: 0; } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
    .v-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border); box-shadow: 2px 2px 0 var(--border); text-decoration: none; border-radius: 2px; cursor: pointer; transition: all 0.1s; &:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border); } &.primary { background: var(--primary); color: #fff; } }
    .code-snippet { font-family: var(--font-mono); color: var(--text-code); background: var(--bg-subtle); padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 0.85em; }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class ProjectPageComponent {
  private api = inject(CmsApiService);
  private route = inject(ActivatedRoute);
  slug = this.route.snapshot.paramMap.get('slug') ?? '';
  project = signal<Project | null>(null);
  loading = signal(true);

  constructor() {
    this.api.getProject(this.slug).subscribe({
      next: p => { this.project.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
