import { Injectable, inject } from '@angular/core';
import { CmsFetchService } from '@vertex-cms/public';
import { Observable, map } from 'rxjs';

export interface CmsListResponse<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author?: { _id: string; email: string };
  categories?: { _id: string; name: string; slug: string }[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  images?: string[];
  categories?: { _id: string; name: string; slug: string }[];
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  client: string;
  description: string;
  tags?: string[];
  gallery?: string[];
  categories?: { _id: string; name: string; slug: string }[];
}

export interface DocPage {
  _id: string;
  title: string;
  slug: string;
  category: string;
  order: number;
  content: string;
  description: string;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  content: any[]; // Blocks
}

export interface MenuItem {
  label: string | Record<string, string>; // localized string or object
  url: string;
  openInNewTab: boolean;
  button?: boolean;
  class?: string;
  children?: MenuItem[];
}

export interface CmsMenu {
  _id: string;
  handle: string;
  label: string;
  items: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class CmsApiService {
  private cms = inject(CmsFetchService);

  private list<T>(slug: string, params: Record<string, string> = {}): Observable<T[]> {
    return this.cms.get<CmsListResponse<T>>(`/api/content/${slug}`, {
      status: 'published',
      limit: '100',
      ...params,
    }).pipe(map(r => r?.docs ?? []));
  }

  private one<T>(slug: string, id: string): Observable<T> {
    return this.cms.get<T>(`/api/content/${slug}/${id}`);
  }

  // ── Blog ──────────────────────────────────────────────────────────────────
  listBlogPosts(): Observable<BlogPost[]> {
    return this.list<BlogPost>('blog-posts', { populate: 'author, categories' });
    // ALLOW FOR SORT ORDER BY FIELD QUERY
    // return this.list<BlogPost>('blog-posts', { sort: '{ publishedAt: -1 }' });
  }
  getBlogPost(slug: string): Observable<BlogPost | null> {
    // TBD: IMPROVED QUERY SYSTEM AS BELOW
    // return this.list<BlogPost>('blog-posts', { 'where[slug][equals]': slug })
    return this.list<BlogPost>('blog-posts', { slug, populate: 'author, categories' })
      .pipe(map(posts => posts[0] ?? null));
  }

  // ── Products ──────────────────────────────────────────────────────────────
  listProducts(): Observable<Product[]> {
    return this.list<Product>('products');
  }
  getProduct(slug: string): Observable<Product | null> {
    return this.list<Product>('products', { slug })
      .pipe(map(items => items[0] ?? null));
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  listProjects(): Observable<Project[]> {
    return this.list<Project>('projects');
  }
  getProject(slug: string): Observable<Project | null> {
    return this.list<Project>('projects', { slug })
      .pipe(map(items => items[0] ?? null));
  }

  // ── Pages (blocks) ────────────────────────────────────────────────────────
  getPage(slug: string): Observable<Page | null> {
    return this.list<Page>('pages', { slug })
      .pipe(map(items => items[0] ?? null));
  }
  listPages(): Observable<Page[]> {
    return this.list<Page>('pages');
  }

  // ── Doc Pages ─────────────────────────────────────────────────────────────
  listDocPages(category?: string): Observable<DocPage[]> {
    const params: Record<string, string> = { sort: 'order' };
    // if (category) params['where[category][equals]'] = category;
    if (category) params['category'] = category;
    return this.list<DocPage>('doc-pages', params);
  }
  getDocPage(category: string, slug: string): Observable<DocPage | null> {
    return this.list<DocPage>('doc-pages', {
    //   'where[slug][equals]': slug,
    //   'where[category][equals]': category,
      'slug': slug,
      'category': category,
    }).pipe(map(items => items[0] ?? null));
  }

  // ── Menus ─────────────────────────────────────────────────────────────────
  getMenu(handle: string): Observable<CmsMenu | null> {
    return this.list<CmsMenu>('menus', { handle })
      .pipe(map(items => items[0] ?? null));
  }
}
