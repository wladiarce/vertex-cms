import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const FEATURES = [
  { icon: '▦', label: '01 // Collections', title: 'Code-First Collections', desc: 'Define data models with TypeScript decorators. Collections auto-generate admin UI, REST APIs, and database schemas.' },
  { icon: '⊞', label: '02 // Blocks', title: 'Visual Block Builder', desc: 'Compose page layouts from reusable blocks. Drag, drop, and reorder content sections with full type safety end-to-end.' },
  { icon: '⚡', label: '03 // SSR + API', title: 'Angular SSR + NestJS', desc: 'First-class Server-Side Rendering with Angular 17. NestJS powers the REST API with JWT auth and file uploads built in.' },
  { icon: '🔌', label: '04 // Plugins', title: 'Plugin Architecture', desc: 'Swap database adapters, storage backends, and email providers via clean plugin interfaces — MongoDB, TypeORM, S3, GCS.' },
  { icon: '✦', label: '05 // Relationships', title: 'Deep Relationships', desc: 'One-to-one and many-to-many relationships with a single decorator. Auto-populated in queries and wired in the admin UI.' },
  { icon: '🌍', label: '06 // i18n', title: 'Localization Ready', desc: 'Mark any field as localized. Fetching content in the right locale is one query param away. Fallback chains automatic.' },
];

const DEMOS = [
  { title: 'Editorial Blog', desc: 'Rich text posts, categories, authors, and images — the classic headless blog powered by VertexCMS collections.', link: '/blog', tag: 'BLOG' },
  { title: 'E-Commerce Demo', desc: 'Products, categories, pricing, and image galleries — all managed from the admin panel and rendered with Angular SSR.', link: '/demo/ecommerce', tag: 'E-COMMERCE' },
  { title: 'Portfolio Demo', desc: 'Projects, galleries, clients, and tags — a complete portfolio backed by VertexCMS with rich filtering.', link: '/demo/portfolio', tag: 'PORTFOLIO' },
];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingPageComponent {
  features = FEATURES;
  demos = DEMOS;
}
