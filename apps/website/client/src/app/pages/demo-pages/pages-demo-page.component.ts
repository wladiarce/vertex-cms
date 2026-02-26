import { Component, inject, signal, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsApiService, Page } from '../../services/cms-api.service';

/** Safely renders CMS HTML without Angular stripping it */
@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? '');
  }
}



@Component({
  selector: 'app-pages-demo-page',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <div class="page-wrap">
      <!-- Topbar -->
      <div class="page-topbar">
        <nav class="v-breadcrumb min-w-0">
          <a routerLink="/demo/pages" class="flex-shrink-0">Pages</a>
          <span class="flex-shrink-0">/</span>
          <span class="v-breadcrumb-current truncate">{{ slug }}</span>
        </nav>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="v-badge">{{ page()?.content?.length ?? 0 }} blocks</span>
          <a routerLink="/demo/pages" class="v-btn">← Pages</a>
        </div>
      </div>

      @if (loading()) {
        <div class="p-8 flex flex-col gap-4 max-w-xl">
          <div class="skeleton-line" style="width:65%;height:32px"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line" style="width:85%"></div>
        </div>
      }

      @if (!loading() && !page()) {
        <div class="p-8 max-w-xl">
          <div class="cms-empty v-card">
            <div class="font-mono">// Page not found</div>
            <p>No published page with slug <code class="code-snippet font-mono">{{ slug }}</code>.</p>
          </div>
        </div>
      }

      @if (!loading() && page(); as p) {
        <!-- Render blocks -->
        @for (block of p.content; track $index) {
          @switch (block.blockType) {

            <!-- ── Hero ─────────────────────────────────────────────────── -->
            @case ('hero') {
              <section class="block-hero bg-grid-pattern">
                <h1 class="hero-headline">{{ block.headline }}</h1>
                @if (block.subheadline) { <p class="hero-sub">{{ block.subheadline }}</p> }
                @if (block.ctaText) {
                  <a [href]="block.ctaLink ?? '#'" class="v-btn primary lg">{{ block.ctaText }}</a>
                }
              </section>
            }

            <!-- ── Text (rich-text) ──────────────────────────────────────── -->
            @case ('text') {
              <section class="block-text">
                <div class="rich-text" [innerHTML]="block.content | safeHtml"></div>
              </section>
            }

            <!-- ── Code Block ────────────────────────────────────────────── -->
            @case ('code-block') {
              <section class="block-code v-card">
                <div class="code-lang-bar font-mono">{{ block.language ?? 'code' }}</div>
                <!-- whitespace:pre on <pre> means \n is honoured; no pipe needed -->
                <pre class="font-mono code-body">{{ block.code }}</pre>
              </section>
            }

            <!-- ── Pricing ───────────────────────────────────────────────── -->
            @case ('pricing') {
              <section class="block-pricing-wrap">
                @if (block.headline) {
                  <div class="pricing-header">
                    <h2 class="pricing-headline">{{ block.headline }}</h2>
                    @if (block.subheadline) {
                      <p class="pricing-sub">{{ block.subheadline }}</p>
                    }
                  </div>
                }

                <div class="pricing-cards">
                  @for (plan of block.plans; track plan.planName) {
                    <div class="pricing-card v-card" [class.pricing-card--featured]="plan.featured">
                      @if (plan.featured) {
                        <div class="pricing-featured-badge font-mono">// Featured</div>
                      }
                      <div class="pricing-plan-name">{{ plan.planName }}</div>
                      <div class="pricing-price font-mono">
                        @if (plan.price === 'Free' || plan.price === '0' || plan.price === 0) {
                          <span class="pricing-amount">Free</span>
                        } @else {
                          <span class="pricing-currency">$</span>
                          <span class="pricing-amount">{{ plan.price }}</span>
                          <span class="pricing-period">/mo</span>
                        }
                      </div>
                      
                      @if (plan.features) {
                        <div class="pricing-features-html" [innerHTML]="plan.features | safeHtml"></div>
                      }
                      
                      <a href="#" class="v-btn pricing-cta" [class.primary]="plan.featured">
                        {{ plan.featured ? 'Get Started' : 'Choose Plan' }}
                      </a>
                    </div>
                  }

                  @if (!block.plans || block.plans.length === 0) {
                    <div class="pricing-no-plans font-mono v-card">
                      // No plans defined yet. Add rows in the admin panel.
                    </div>
                  }
                </div>
              </section>
            }

            <!-- ── Image ─────────────────────────────────────────────────── -->
            @case ('image') {
              <section class="block-image-wrap">
                <div class="image-placeholder font-mono">IMAGE // BLOCK</div>
              </section>
            }

            <!-- ── Unknown ───────────────────────────────────────────────── -->
            @default {
              <div class="block-unknown font-mono">// {{ block.blockType }}</div>
            }
          }
        }

        @if (!p.content || p.content.length === 0) {
          <div class="p-8 max-w-xl">
            <div class="cms-empty v-card">
              <div class="font-mono">// Empty page</div>
              <p>This page has no blocks yet. Add blocks in the admin panel.</p>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-wrap { font-family: var(--font-ui); }
    .page-topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-dim); background: var(--bg-surface); flex-wrap: wrap; }
    .v-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-muted); min-width: 0; a { color: var(--text-muted); text-decoration: none; &:hover { color: var(--primary); } } }
    .v-breadcrumb-current { color: var(--text-main); font-weight: 600; }
    /* ── Hero ──────────────────────────────────────────────────────────── */
    .block-hero { padding: 5rem 2rem 4rem; border-bottom: 2px solid var(--border); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
    .hero-headline { font-size: clamp(2rem, 7vw, 5rem); font-weight: 700; letter-spacing: -0.03em; margin: 0; }
    .hero-sub { font-size: 1.1rem; color: var(--text-muted); max-width: 580px; line-height: 1.65; margin: 0; }

    /* ── Text ──────────────────────────────────────────────────────────── */
    .block-text { padding: 3rem 1.5rem; max-width: 760px; margin: 0 auto; border-bottom: 1px solid var(--border-dim); }
    // .block-text { padding: 2.5rem 1.5rem; max-width: 760px; margin: 0 auto; }

    /* ── Code ──────────────────────────────────────────────────────────── */
    .block-code { overflow: hidden; margin: 2rem 1.5rem; }
    .code-lang-bar { background: var(--text-main); color: var(--bg-surface); padding: 0.6rem 1rem; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .code-body {
      margin: 0;
      padding: 1.25rem 1.5rem;
      font-size: 0.85rem;
      line-height: 1.65;
      color: #e0e0e0;
      background: color-mix(in srgb, var(--text-main) 95%, transparent);
      overflow-x: auto;
      // white-space: pre;
    }
    // .block-code { overflow: hidden; margin: 1.5rem; }
    // .code-lang-bar { background: var(--text-main); color: var(--bg-surface); padding: 0.6rem 1rem; font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .code-body { margin: 0; padding: 1.25rem 1.5rem; font-size: 0.85rem; line-height: 1.65; color: var(--text-muted); background: var(--bg-input); overflow-x: auto; }
    /* ── Pricing ───────────────────────────────────────────────────────── */
    .block-pricing-wrap {
      padding: 4rem 1.5rem;
      border-bottom: 1px solid var(--border-dim);
    }
    .pricing-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .pricing-headline {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 0 0 0.75rem;
    }
    .pricing-sub {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.6;
    }
    .pricing-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    .pricing-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 2rem 1.75rem;
      position: relative;
      transition: transform 0.15s, box-shadow 0.15s;

      &:hover { transform: translateY(-3px); box-shadow: 6px 6px 0 var(--border); }

      &--featured {
        border-color: var(--primary);
        box-shadow: 4px 4px 0 var(--primary);
        &:hover { box-shadow: 7px 7px 0 var(--primary); }
      }
    }
    .pricing-featured-badge {
      position: absolute;
      top: -1px;
      right: 1.25rem;
      background: var(--primary);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .pricing-plan-name {
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }
    .pricing-price {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
    }
    .pricing-currency { font-size: 1.2rem; font-weight: 700; color: var(--text-muted); }
    .pricing-amount { font-size: 3rem; font-weight: 700; letter-spacing: -0.04em; color: var(--text-main); line-height: 1; }
    .pricing-period { font-size: 0.85rem; color: var(--text-muted); margin-left: 0.2rem; }
    .pricing-features {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      flex: 1;
    }
    .pricing-feature {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .pricing-check {
      color: var(--primary);
      font-weight: 700;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      flex-shrink: 0;
      margin-top: 0.1em;
    }
    .pricing-cta { width: 100%; justify-content: center; }
    .pricing-features-html {
      font-size: 0.9rem;
      color: var(--text-muted);
      flex: 1;
      ::ng-deep {
        ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        li { position: relative; padding-left: 1.5rem; }
        li::before { content: '✓'; position: absolute; left: 0; color: var(--primary); font-weight: 700; font-family: var(--font-mono); }
      }
    }
    .pricing-no-plans { padding: 1.5rem; font-size: 0.8rem; color: var(--text-muted); }
    /* ── Image ─────────────────────────────────────────────────────────── */
    .block-image-wrap { border-top: 1px solid var(--border-dim); border-bottom: 1px solid var(--border-dim); }
    .image-placeholder { height: 280px; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--border-dim); letter-spacing: 0.15em; text-transform: uppercase; }
    /* ── Unknown ───────────────────────────────────────────────────────── */
    .block-unknown { padding: 1rem 1.5rem; font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid var(--border-dim); }
    /* ── Rich text ─────────────────────────────────────────────────────── */
    :host ::ng-deep .rich-text {
      font-size: 1rem;
      line-height: 1.8;
      h1,h2,h3 { font-weight: 700; margin: 1.25em 0 0.5em; }
      h2 { font-size: 1.4rem; border-bottom: 2px solid var(--border-dim); padding-bottom: 0.4rem; }
      p { margin: 0 0 1em; }
      code { font-family: var(--font-mono); font-size: 0.875em; background: var(--bg-subtle); padding: 0.1rem 0.35rem; color: var(--primary); border: 1px solid var(--border-dim); }
      pre { background: var(--text-main); color: #e0e0e0; padding: 1.25rem; border-radius: var(--radius); overflow-x: auto; font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.65; margin: 1.5rem 0; white-space: pre; code { background: transparent; border: none; color: inherit; padding: 0; } }
      ul,ol { padding-left: 1.5rem; margin-bottom: 1em; li { margin-bottom: 0.4rem; p { margin: 0; } } }
      a { color: var(--primary); text-decoration: underline; }
      strong { font-weight: 700; }
      blockquote { border-left: 3px solid var(--primary); padding-left: 1rem; margin: 1.5rem 0; color: var(--text-muted); font-style: italic; }
    }
    /* ── States ────────────────────────────────────────────────────────── */
    .skeleton-line { height: 14px; background: var(--border-dim); border-radius: 2px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .cms-empty { padding: 2rem; display: flex; flex-direction: column; gap: 0.5rem; .font-mono { color: var(--primary); font-size: 0.75rem; font-weight: 700; } p { font-size: 0.9rem; color: var(--text-muted); margin: 0; } }
    .v-card { background: var(--bg-surface); border: 1px solid var(--border); box-shadow: 3px 3px 0 var(--border); border-radius: 2px; }
    .v-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; border-radius: 2px; border: 1px solid var(--border-dim); background: var(--bg-subtle); color: var(--text-muted); }
    .v-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.55rem 1.1rem; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border); box-shadow: 2px 2px 0 var(--border); text-decoration: none; border-radius: 2px; cursor: pointer; transition: all 0.1s; &:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border); } &.primary { background: var(--primary); color: #fff;} &.lg { padding: 0.9rem 2rem; font-size: 0.9rem; } }
    .code-snippet { font-family: var(--font-mono); color: var(--primary); background: var(--bg-subtle); padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 0.85em; }
    .font-mono { font-family: var(--font-mono); }
    .bg-grid-pattern { background-image: radial-gradient(circle, var(--border-dim) 1px, transparent 1px); background-size: 24px 24px; }
  `]
})
export class PagesDemoPageComponent {
  private api = inject(CmsApiService);
  private route = inject(ActivatedRoute);
  slug = this.route.snapshot.paramMap.get('slug') ?? '';
  page = signal<Page | null>(null);
  loading = signal(true);

  constructor() {
    this.api.getPage(this.slug).subscribe({
      next: p => { this.page.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
