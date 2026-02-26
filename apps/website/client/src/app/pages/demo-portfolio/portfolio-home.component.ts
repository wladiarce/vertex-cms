import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsApiService, Project } from '../../services/cms-api.service';

@Component({
  selector: 'app-portfolio-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="portfolio-wrap">
      <div class="portfolio-masthead">
        <div class="masthead-inner">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="v-badge">Demo // Portfolio</span>
            <span class="font-mono" style="font-size:0.72rem;color:var(--text-muted)">2026</span>
          </div>
          <h1 class="masthead-title">Selected<br><span class="masthead-accent">Work.</span></h1>
          <p class="masthead-desc">Projects managed with VertexCMS — editable from the admin panel in real time.</p>
        </div>
        <div class="hidden sm:flex gap-8 pb-2">
          <div class="text-right">
            <div class="mstat-num font-mono">{{ projects().length }}</div>
            <div class="mstat-label font-mono">Projects</div>
          </div>
        </div>
      </div>

      <div class="portfolio-body">
        <!-- Table head (md+) -->
        <div class="project-table-head font-mono hidden md:grid">
          <span>#</span><span>PROJECT</span><span>CLIENT</span><span>TAGS</span><span>YEAR</span>
        </div>

        @if (loading()) {
          @for (_ of [1,2,3]; track _) {
            <div class="project-item">
              <div class="project-card md:hidden">
                <div class="flex items-center gap-3">
                  <div style="width:34px;height:34px;background:var(--bg-subtle)"></div>
                  <div class="flex-1 flex flex-col gap-2">
                    <div class="skeleton-line" style="width:60%"></div>
                    <div class="skeleton-line" style="width:35%"></div>
                  </div>
                </div>
              </div>
              <div class="project-row hidden md:grid">
                <div class="skeleton-line" style="width:20px"></div>
                <div class="skeleton-line" style="width:70%"></div>
                <div class="skeleton-line" style="width:60%"></div>
                <div class="skeleton-line" style="width:40%"></div>
                <div class="skeleton-line" style="width:30px"></div>
              </div>
            </div>
          }
        }

        @if (!loading() && projects().length === 0 && !error()) {
          <div class="p-6">
            <div class="cms-empty v-card">
              <div class="font-mono">// No projects yet</div>
              <p>Create <strong>projects</strong> in the admin panel and publish them.</p>
            </div>
          </div>
        }

        @if (error()) {
          <div class="p-6">
            <div class="cms-empty v-card">
              <div class="font-mono">// API Error</div>
              <p>{{ error() }}</p>
            </div>
          </div>
        }

        @for (p of projects(); track p._id; let i = $index) {
          <a [routerLink]="['/demo/portfolio', p.slug]" class="project-item">
            <!-- Desktop row -->
            <div class="project-row hidden md:grid">
              <div class="project-num font-mono">{{ (i+1).toString().padStart(2,'0') }}</div>
              <div class="flex items-center gap-3">
                <div class="project-icon">{{ p.title.substring(0,3).toUpperCase() }}</div>
                <h3 class="project-title-text">{{ p.title }}</h3>
              </div>
              <div class="project-client font-mono">{{ p.client }}</div>
              <div class="flex gap-2 flex-wrap">
                @for (tag of (p.tags ?? []); track tag) {
                  <span class="v-badge">{{ tag }}</span>
                }
              </div>
              <div class="flex items-center justify-between">
                <span class="project-arrow">→</span>
              </div>
            </div>
            <!-- Mobile card -->
            <div class="project-card md:hidden">
              <div class="flex items-center gap-3">
                <div class="project-icon">{{ p.title.substring(0,3).toUpperCase() }}</div>
                <div class="min-w-0">
                  <h3 class="project-title-text">{{ p.title }}</h3>
                  <div class="project-client font-mono mt-1">{{ p.client }}</div>
                </div>
                <span class="project-arrow ml-auto flex-shrink-0">→</span>
              </div>
              <div class="flex gap-2 flex-wrap mt-3">
                @for (tag of (p.tags ?? []); track tag) {
                  <span class="v-badge">{{ tag }}</span>
                }
              </div>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .portfolio-wrap { font-family: var(--font-ui); }
    .portfolio-masthead { border-bottom: 2px solid var(--border); padding: 3rem 1.5rem 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; }
    .masthead-inner { max-width: 580px; display: flex; flex-direction: column; gap: 1.1rem; }
    .masthead-title { font-size: clamp(3rem, 10vw, 6rem); font-weight: 700; line-height: 0.9; letter-spacing: -0.04em; margin: 0; }
    .masthead-accent { color: var(--primary); }
    .masthead-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.65; margin: 0; }
    .mstat-num { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1; }
    .mstat-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); }
    .portfolio-body { }
    .project-table-head { grid-template-columns: 48px 1fr 160px 200px 48px; gap: 1rem; padding: 0.65rem 1.5rem; background: var(--bg-subtle); border-bottom: 1px solid var(--border-dim); font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
    .project-item { display: block; text-decoration: none; color: var(--text-main); border-bottom: 1px solid var(--border-dim); transition: background 0.15s; &:hover { background: var(--bg-subtle); .project-arrow { color: var(--primary); } } }
    .project-row { grid-template-columns: 48px 1fr 160px 200px 48px; gap: 1rem; align-items: center; padding: 1.1rem 1.5rem; }
    .project-card { padding: 1rem 1.5rem; }
    .project-num { font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); }
    .project-icon { width: 34px; height: 34px; background: var(--text-main); color: var(--bg-surface); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 0.55rem; font-weight: 700; flex-shrink: 0; }
    .project-title-text { font-size: 0.95rem; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .project-client { font-size: 0.78rem; color: var(--text-muted); }
    .project-arrow { color: var(--border-dim); font-size: 1rem; transition: color 0.15s; }
    .skeleton-line { height: 12px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; color: var(--text-muted); .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; margin: 0; } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.12rem 0.45rem; font-family: var(--font-mono); font-size: 0.65rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); white-space: nowrap; }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class PortfolioHomeComponent {
  private api = inject(CmsApiService);
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.api.listProjects().subscribe({
      next: p => { this.projects.set(p); this.loading.set(false); },
      error: e => { this.error.set(e?.message ?? 'API error'); this.loading.set(false); }
    });
  }
}
