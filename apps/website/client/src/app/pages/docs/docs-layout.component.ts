import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const NAV = [
  { label: 'Getting Started', items: [
    { label: 'Installation', link: '/docs/getting-started/installation' },
    { label: 'First Project', link: '/docs/getting-started/first-project' },
    { label: 'Project Structure', link: '/docs/getting-started/project-structure' },
  ]},
  { label: 'Core Concepts', items: [
    { label: 'Collections', link: '/docs/core-concepts/collections' },
    { label: 'Fields', link: '/docs/core-concepts/fields' },
    { label: 'Blocks', link: '/docs/core-concepts/blocks' },
    { label: 'Relationships', link: '/docs/core-concepts/relationships' },
    { label: 'Drafts & Versions', link: '/docs/core-concepts/drafts' },
  ]},
  { label: 'Guides', items: [
    { label: 'Auth & Users', link: '/docs/guides/auth' },
    { label: 'Media & Uploads', link: '/docs/guides/media' },
    { label: 'Plugins', link: '/docs/guides/plugins' },
    { label: 'Webhooks', link: '/docs/guides/webhooks' },
  ]},
  { label: 'API Reference', items: [
    { label: 'REST API', link: '/docs/api-reference/rest' },
    { label: 'Config Options', link: '/docs/api-reference/config' },
  ]},
];

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="docs-shell">
      <!-- Mobile: top nav toggle strip -->
      <div class="docs-mobile-nav">
        <button class="docs-mobile-toggle font-mono" (click)="sidebarOpen = !sidebarOpen">
          {{ sidebarOpen ? '✕ Close' : '☰ Docs Menu' }}
        </button>
        <a routerLink="/" class="back-home font-mono">← home</a>
      </div>

      <!-- Sidebar — hidden on mobile unless toggled -->
      <aside class="docs-sidebar" [class.open]="sidebarOpen">
        <div class="docs-sidebar-inner">
          <div class="docs-logo-row">
            <a routerLink="/" class="back-home font-mono">← vertex.dev</a>
            <div class="docs-title">
              <div class="docs-icon">VX</div>
              <span>Docs</span>
            </div>
          </div>

          <nav class="docs-nav">
            <div *ngFor="let group of navGroups" class="nav-group">
              <div class="nav-group-label font-mono">{{ group.label }}</div>
              <ul>
                <li *ngFor="let item of group.items">
                  <a [routerLink]="item.link" routerLinkActive="active" class="nav-link"
                     (click)="sidebarOpen = false">
                    {{ item.label }}
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div class="docs-sidebar-footer">
            <span class="v-badge">v0.7.0</span>
            <a routerLink="/admin" class="font-mono admin-link">Admin →</a>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="docs-content" (click)="sidebarOpen = false">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .docs-shell {
      display: flex;
      min-height: calc(100vh - 60px);
      position: relative;
    }

    /* Mobile strip */
    .docs-mobile-nav {
      display: none;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-dim);
      background: var(--bg-surface);
      position: sticky;
      top: 60px;
      z-index: 50;
    }
    .docs-mobile-toggle {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--bg-subtle);
      border: 1px solid var(--border-dim);
      color: var(--text-main);
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      border-radius: var(--radius);
    }

    @media (max-width: 768px) {
      .docs-mobile-nav { display: flex; }
    }

    /* Sidebar */
    .docs-sidebar {
      width: 260px;
      flex-shrink: 0;
      background: var(--bg-input);
      border-right: 1px solid var(--border);
      position: sticky;
      top: 60px;
      height: calc(100vh - 60px);
      overflow-y: auto;
      transition: transform 0.25s ease;
    }

    @media (max-width: 768px) {
      .docs-sidebar {
        position: fixed;
        top: 60px;
        left: 0;
        height: calc(100vh - 60px);
        z-index: 40;
        transform: translateX(-100%);
        box-shadow: none;

        &.open {
          transform: translateX(0);
          box-shadow: 4px 0 20px rgba(0,0,0,0.15);
        }
      }
    }

    .docs-sidebar-inner { display: flex; flex-direction: column; height: 100%; padding: 1.5rem 0; }
    .docs-logo-row { padding: 0 1.25rem 1.25rem; border-bottom: 1px solid var(--border-dim); margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .back-home { font-size: 0.7rem; color: var(--text-muted); text-decoration: none; font-family: var(--font-mono); transition: color 0.15s; &:hover { color: var(--primary); } }
    .docs-title { display: flex; align-items: center; gap: 0.6rem; font-weight: 700; font-size: 0.95rem; .docs-icon { width: 24px; height: 24px; background: var(--primary); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700; color: white; } }
    .docs-nav { flex: 1; padding: 0 0.5rem; }
    .nav-group { margin-bottom: 1.5rem; }
    .nav-group-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; padding: 0 0.75rem; margin-bottom: 0.4rem; font-family: var(--font-mono); }
    .nav-group ul { list-style: none; padding: 0; margin: 0; }
    .nav-link { display: block; padding: 0.4rem 0.75rem; font-size: 0.875rem; color: var(--text-muted); text-decoration: none; border-radius: var(--radius); border-left: 2px solid transparent; transition: all 0.15s; margin-bottom: 0.05rem; &:hover { color: var(--text-main); background: var(--bg-subtle); } &.active { color: var(--primary); background: rgba(255,79,0,0.06); border-left-color: var(--primary); font-weight: 600; } }
    .docs-sidebar-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border-dim); margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
    .admin-link { font-size: 0.7rem; color: var(--primary); text-decoration: none; font-family: var(--font-mono); &:hover { text-decoration: underline; } }
    .docs-content { flex: 1; min-width: 0; }
    .font-mono { font-family: var(--font-mono); }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
  `]
})
export class DocsLayoutComponent {
  navGroups = NAV;
  sidebarOpen = false;
}
