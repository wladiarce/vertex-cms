import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CmsApiService, Product } from '../../services/cms-api.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-wrap">
      <div class="product-topbar">
        <nav class="v-breadcrumb min-w-0">
          <a routerLink="/demo/ecommerce" class="flex-shrink-0">Store</a>
          <span class="flex-shrink-0">/</span>
          <span class="v-breadcrumb-current truncate">{{ slug }}</span>
        </nav>
        <a routerLink="/demo/ecommerce" class="v-btn flex-shrink-0">← Store</a>
      </div>

      @if (loading()) {
        <div class="product-layout">
          <div class="product-gallery-col p-6">
            <div style="height:360px;background:var(--bg-subtle);border:1px solid var(--border-dim)"></div>
          </div>
          <div class="product-details-col">
            <div class="flex flex-col gap-4">
              <div class="skeleton-line" style="width:25%"></div>
              <div class="skeleton-line" style="width:70%;height:36px"></div>
              <div class="skeleton-line" style="width:20%"></div>
            </div>
          </div>
        </div>
      }

      @if (!loading() && !product()) {
        <div class="p-8 max-w-xl mx-auto">
          <div class="cms-empty v-card">
            <div class="font-mono">// Product not found</div>
            <p>No published product with slug <code class="code-snippet font-mono">{{ slug }}</code>.</p>
            <a routerLink="/demo/ecommerce" class="v-btn" style="margin-top:0.5rem;width:fit-content">← Back to Store</a>
          </div>
        </div>
      }

      @if (!loading() && product(); as p) {
        <div class="product-layout">
          <!-- Gallery -->
          <div class="product-gallery-col">
            <div class="product-main-image v-card m-4 lg:m-6">
              <div class="product-image-placeholder">
                <div class="product-img-label font-mono">{{ p.name.substring(0,3).toUpperCase() }}</div>
              </div>
            </div>
            <div class="flex gap-3 px-4 pb-4 lg:px-6 lg:pb-6">
              @for (i of [1,2,3]; track i) {
                <div class="thumb v-card"><div class="thumb-inner font-mono">0{{ i }}</div></div>
              }
            </div>
          </div>

          <!-- Details -->
          <div class="product-details-col">
            <div class="flex items-center gap-3 flex-wrap">
              @if (p.categories?.[0]) {
                <span class="product-category font-mono">{{ p.categories?.[0]?.name }}</span>
              }
              <span class="v-badge">IN STOCK</span>
            </div>
            <h1 class="product-name">{{ p.name }}</h1>

            <div class="price-block v-card">
              <div class="price-label font-mono">PRICE</div>
              <div class="price-amount font-mono">\${{ p.price.toFixed(2) }}</div>
              <div class="price-note font-mono">// Free shipping · Returns accepted</div>
            </div>

            @if (p.description) {
              <div class="product-description">
                <div class="desc-header font-mono">// Description</div>
                <div class="rich-text" [innerHTML]="p.description"></div>
              </div>
            }

            <div class="flex flex-wrap gap-3">
              <button class="v-btn primary lg flex-1 min-w-0 justify-center">Add to Cart</button>
              <a routerLink="/admin" class="v-btn lg">Edit in Admin →</a>
            </div>

            <!-- CMS data -->
            <div class="cms-note v-card">
              <div class="cms-note-bar">
                <span class="font-mono">// VertexCMS Source</span>
                <span class="v-badge">products</span>
              </div>
              <div>
                <div class="data-row"><span class="font-mono data-key">_id</span><span class="font-mono data-val truncate">{{ p._id }}</span></div>
                <div class="data-row"><span class="font-mono data-key">slug</span><span class="font-mono data-val">{{ p.slug }}</span></div>
                <div class="data-row"><span class="font-mono data-key">status</span><span class="v-badge status-pub">PUBLISHED</span></div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-wrap { font-family: var(--font-ui); }
    .product-topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-dim); background: var(--bg-surface); }
    .v-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-muted); a { color: var(--text-muted); text-decoration: none; &:hover { color: var(--primary); } } }
    .v-breadcrumb-current { color: var(--text-main); font-weight: 600; }
    .product-layout { display: flex; flex-direction: column; @media (min-width: 1024px) { flex-direction: row; min-height: calc(100vh - 60px - 105px); } }
    .product-gallery-col { display: flex; flex-direction: column; @media (min-width: 1024px) { width: 55%; border-right: 1px solid var(--border); flex-shrink: 0; } }
    .product-main-image { display: flex; align-items: center; justify-content: center; flex: 1; }
    .product-image-placeholder { width: 100%; min-height: 220px; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; }
    .product-img-label { font-size: clamp(2.5rem, 8vw, 4rem); font-weight: 700; color: var(--border-dim); letter-spacing: -0.05em; }
    .thumb { width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .thumb-inner { font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); }
    .product-details-col { padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; @media (min-width: 1024px) { flex: 1; padding: 2.5rem; } }
    .product-category { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); font-weight: 700; }
    .product-name { font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 700; letter-spacing: -0.03em; margin: 0; line-height: 1.1; }
    .price-block { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem; }
    .price-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; }
    .price-amount { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; }
    .price-note { font-size: 0.68rem; color: var(--text-muted); }
    .product-description { display: flex; flex-direction: column; gap: 0.5rem; }
    .desc-header { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; }
    .rich-text { font-size: 0.9rem; color: var(--text-muted); line-height: 1.65; p { margin: 0 0 0.75em; } }
    .cms-note { overflow: hidden; }
    .cms-note-bar { background: var(--text-main); color: var(--bg-surface); padding: 0.55rem 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; }
    .data-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-dim); font-size: 0.85rem; &:last-child { border-bottom: none; } }
    .data-key { font-size: 0.72rem; color: var(--text-muted); flex-shrink: 0; }
    .data-val { font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; }
    .status-pub { background: #e6fffa; color: #047857; border-color: #047857; }
    .skeleton-line { height: 14px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; color: var(--text-muted); .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; margin: 0; } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
    .code-snippet { font-family: var(--font-mono); color: var(--text-code); background: var(--bg-subtle); padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 0.85em; }
    .v-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border); box-shadow: 2px 2px 0 var(--border); text-decoration: none; border-radius: 2px; cursor: pointer; transition: all 0.1s; &:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border); } &.primary { background: var(--primary); color: #fff; } &.lg { padding: 0.75rem 1.4rem; font-size: 0.85rem; } }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class ProductPageComponent {
  private api = inject(CmsApiService);
  private route = inject(ActivatedRoute);
  slug = this.route.snapshot.paramMap.get('slug') ?? '';
  product = signal<Product | null>(null);
  loading = signal(true);

  constructor() {
    this.api.getProduct(this.slug).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
