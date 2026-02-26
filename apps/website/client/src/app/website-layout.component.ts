import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VertexLogoComponent } from '@vertex-cms/admin';

@Component({
  selector: 'app-website-layout',
  standalone: true,
  imports: [RouterModule, VertexLogoComponent],
  template: `
    <header class="site-header">
      <div class="site-header-inner">
        <a routerLink="/" class="site-logo">
          <vertex-logo [size]="'sm'"></vertex-logo>
        </a>

        <nav class="site-nav">
          <!-- Text links: hidden on mobile (< 640px) via CSS -->
          <div class="nav-text-links">
            <a routerLink="/docs" routerLinkActive="active">Docs</a>
            <a routerLink="/blog" routerLinkActive="active">Blog</a>
            <div class="nav-dropdown">
              <span class="nav-dropdown-trigger">Demos ▾</span>
              <div class="nav-dropdown-menu">
                <a routerLink="/demo/ecommerce" routerLinkActive="active">E-Commerce</a>
                <a routerLink="/demo/portfolio" routerLinkActive="active">Portfolio</a>
                <a routerLink="/demo/pages" routerLinkActive="active">Pages &amp; Blocks</a>
              </div>
            </div>
          </div>
          <!-- Admin button always visible -->
          <div routerLink="/admin" class="nav-admin-btn">
            <span class="nav-admin-icon">▸</span>
            Admin Panel
          </div>
        </nav>
      </div>
    </header>

    <main class="page-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="logo-mark">VX</div>
            <span>VertexCMS</span>
          </div>
          <p>// Headless CMS for developers</p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>Product</h4>
            <ul>
              <li><a routerLink="/docs">Documentation</a></li>
              <li><a routerLink="/blog">Blog</a></li>
              <li><a [routerLink]="['/admin']">Admin Panel</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>Demos</h4>
            <ul>
              <li><a routerLink="/blog">Blog</a></li>
              <li><a routerLink="/demo/ecommerce">E-Commerce</a></li>
              <li><a routerLink="/demo/portfolio">Portfolio</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-copyright">
        <span>© 2026 VertexCMS</span>
        <span>Built with Angular + NestJS // <span>Open Source</span></span>
      </div>
    </footer>
  `,
})
export class WebsiteLayoutComponent {}
