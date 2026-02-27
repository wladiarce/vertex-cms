import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsApiService, Product } from '../../services/cms-api.service';

@Component({
  selector: 'app-ecommerce-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shop-wrap">
      <!-- Hero Banner -->
      <div class="shop-hero-wrapper bg-grid-pattern">
        <div class="shop-hero">
        <div class="shop-hero-content">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="v-badge">Demo // E-Commerce</span>
            <span class="font-mono" style="font-size:0.72rem;color:var(--text-muted)">Powered by VertexCMS</span>
          </div>
          <h1 class="shop-title">Vertex Store</h1>
          <p class="shop-desc">Products and categories are managed from the VertexCMS admin panel and served via the REST API.</p>
        </div>
        
        <div class="shop-stats hidden sm:flex">
          <div class="stat v-card">
            <div class="stat-num font-mono">{{ products().length }}</div>
            <div class="stat-label font-mono">Products</div>
          </div>
          <div class="stat v-card">
            <div class="stat-num font-mono">API</div>
            <div class="stat-label font-mono">Powered</div>
          </div>
        </div>
      </div>
      </div>

      <!-- Products Grid -->
      <div class="shop-body">
        <div class="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <div class="v-section-label" style="margin-bottom:0">
            <div class="v-section-num">Products</div>
            <span>All Items ({{ products().length }})</span>
          </div>
          <a routerLink="/admin" class="v-btn" style="font-size:0.7rem">Manage in Admin →</a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (_ of [1,2,3,4]; track _) {
              <div class="v-card overflow-hidden">
                <div style="height:180px;background:var(--bg-subtle)"></div>
                <div class="p-4 flex flex-col gap-2">
                  <div class="skeleton-line" style="width:40%"></div>
                  <div class="skeleton-line" style="width:80%"></div>
                  <div class="skeleton-line" style="width:30%"></div>
                </div>
              </div>
            }
          </div>
        }

        @if (!loading() && products().length === 0 && !error()) {
          <div class="cms-empty v-card">
            <div class="font-mono">// No products yet</div>
            <p>Create <strong>products</strong> in the admin panel and publish them to display them here.</p>
          </div>
        }

        @if (error()) {
          <div class="cms-empty v-card">
            <div class="font-mono">// API Error</div>
            <p>{{ error() }}</p>
          </div>
        }

        @if (!loading() && products().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (p of products(); track p._id) {
              <a [routerLink]="['/demo/ecommerce', p.slug]" class="product-card v-card">
                <div class="product-image">
                  <div class="product-img-placeholder font-mono">
                    {{ p.name.substring(0, 3).toUpperCase() }}
                  </div>
                </div>
                <div class="product-info">
                  <div class="product-category font-mono">
                    {{ p.categories?.[0]?.name ?? 'Product' }}
                  </div>
                  <h3 class="product-name">{{ p.name }}</h3>
                  <div class="flex justify-between items-center mt-2">
                    <span class="product-price font-mono">\${{ p.price.toFixed(2) }}</span>
                    <span class="product-cta font-mono">View →</span>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .shop-wrap { font-family: var(--font-ui); }
    .shop-hero-wrapper { width: 100%; display: flex; justify-content: center; border-bottom: 2px solid var(--border); }
    .shop-hero { max-width: 1280px; width: 100%;  display: flex; justify-content: space-between; align-items: flex-end;padding: 3rem 1.5rem; gap: 2rem; flex-wrap: wrap; }
    .shop-hero-content { max-width: 560px; display: flex; flex-direction: column; gap: 1rem; }
    .shop-title { font-size: clamp(2.25rem, 6vw, 4rem); font-weight: 700; letter-spacing: -0.035em; margin: 0; }
    .shop-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0; }
    .shop-stats { display: flex; gap: 1rem; flex-wrap: wrap; }
    .stat { padding: 0.85rem 1rem; text-align: center; min-width: 72px; }
    .stat-num { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.2rem; }
    .stat-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); }
    .shop-body { padding: 2.5rem 1.5rem; max-width: 1280px; margin: 0 auto; }
    .v-section-label { display: flex; align-items: center; gap: 0.75rem; }
    .v-section-num { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; background: var(--text-main); color: var(--bg-app); padding: 0.2rem 0.5rem; }
    .product-card { display: flex; flex-direction: column; text-decoration: none; color: var(--text-main); overflow: hidden; transition: transform 0.1s, box-shadow 0.1s; &:hover { transform: translate(-2px,-2px); box-shadow: var(--shadow-hover); } }
    .product-image { background: var(--bg-subtle); height: 180px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-dim); }
    .product-img-placeholder { font-size: 2.25rem; font-weight: 700; color: var(--border-dim); letter-spacing: -0.05em; }
    .product-info { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .product-category { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 700; }
    .product-name { font-size: 1rem; font-weight: 700; margin: 0; }
    .product-price { font-weight: 700; font-size: 1.05rem; }
    .product-cta { font-size: 0.68rem; color: var(--primary); font-weight: 700; }
    .skeleton-line { height: 12px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; color: var(--text-muted); .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; margin: 0; } }
    .v-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border); box-shadow: 2px 2px 0 var(--border); text-decoration: none; border-radius: 2px; transition: all 0.1s; &:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border); } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class EcommerceHomeComponent {
  private api = inject(CmsApiService);
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.api.listProducts().subscribe({
      next: p => { this.products.set(p); this.loading.set(false); },
      error: e => { this.error.set(e?.message ?? 'API error'); this.loading.set(false); }
    });
  }
}
