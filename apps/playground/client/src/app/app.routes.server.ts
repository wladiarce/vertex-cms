import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/**',
    renderMode: RenderMode.Client, // CSR for admin - no SSR issues!
  },
  {
    path: '**',
    renderMode: RenderMode.Server, // SSR for public pages (SEO)
  },
];
