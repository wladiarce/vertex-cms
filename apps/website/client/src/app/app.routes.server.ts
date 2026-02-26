import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Admin panel must be CSR-only — it uses browser APIs (localStorage, DOM events)
    // and cannot be prerendered or server-rendered.
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    // All public pages use SSR for fast loads and SEO.
    path: '**',
    renderMode: RenderMode.Server,
  },
];
