import { Route } from '@angular/router';
import { adminRoutes } from '@vertex-cms/admin';
import { WebsiteLayoutComponent } from './website-layout.component';

export const appRoutes: Route[] = [
  // ─── Admin Panel (CSR-only, NO website header/footer) ─────────────────────
  {
    path: 'admin',
    children: adminRoutes,
  },

  // ─── Public Website (wrapped in header + footer layout) ───────────────────
  {
    path: '',
    component: WebsiteLayoutComponent,
    // loadComponent: () =>
    //   import('./website-layout.component').then(c => c.WebsiteLayoutComponent),
    children: [
      // Landing
      {
        path: '',
        loadComponent: () =>
          import('./pages/landing/landing.component').then(c => c.LandingPageComponent),
      },

      // Docs
      {
        path: 'docs',
        loadComponent: () =>
          import('./pages/docs/docs-layout.component').then(c => c.DocsLayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/docs/docs-home.component').then(c => c.DocsHomeComponent),
          },
          {
            path: ':category/:slug',
            loadComponent: () =>
              import('./pages/docs/doc-page/docs-page.component').then(c => c.DocsPageComponent),
          },
        ],
      },

      // Blog
      {
        path: 'blog',
        loadComponent: () =>
          import('./pages/blog/blog-list.component').then(c => c.BlogListComponent),
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./pages/blog/blog-post.component').then(c => c.BlogPostComponent),
      },

      // Demo: E-Commerce
      {
        path: 'demo/ecommerce',
        loadComponent: () =>
          import('./pages/demo-ecommerce/ecommerce-home.component').then(c => c.EcommerceHomeComponent),
      },
      {
        path: 'demo/ecommerce/:slug',
        loadComponent: () =>
          import('./pages/demo-ecommerce/product-page.component').then(c => c.ProductPageComponent),
      },

      // Demo: Portfolio
      {
        path: 'demo/portfolio',
        loadComponent: () =>
          import('./pages/demo-portfolio/portfolio-home.component').then(c => c.PortfolioHomeComponent),
      },
      {
        path: 'demo/portfolio/:slug',
        loadComponent: () =>
          import('./pages/demo-portfolio/project-page.component').then(c => c.ProjectPageComponent),
      },

      // Demo: Pages & Blocks
      {
        path: 'demo/pages',
        loadComponent: () =>
          import('./pages/demo-pages/pages-demo-home.component').then(c => c.PagesDemoHomeComponent),
      },
      {
        path: 'demo/pages/:slug',
        loadComponent: () =>
          import('./pages/demo-pages/pages-demo-page.component').then(c => c.PagesDemoPageComponent),
      },
    ],
  },
];
