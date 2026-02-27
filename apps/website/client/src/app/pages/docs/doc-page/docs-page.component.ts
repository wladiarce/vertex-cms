import { Component, inject, Pipe, PipeTransform, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsApiService, DocPage } from '../../../services/cms-api.service';

@Pipe({ name: 'titleCase', standalone: true })
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? '');
  }
}

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe, SafeHtmlPipe],
  templateUrl: './docs-page.component.html',
  styleUrl: './docs-page.component.scss'
})
export class DocsPageComponent {
  private api = inject(CmsApiService);
  private route = inject(ActivatedRoute);

  // Signals driven by paramMap — updated on every navigation, not just init
  category = signal('');
  slug = signal('');
  page = signal<DocPage | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    // Subscribe to paramMap so sidebar navigation (same component, new params)
    // triggers a fresh API call instead of showing stale content.
    this.route.paramMap.subscribe(params => {
      const cat = params.get('category') ?? '';
      const sl  = params.get('slug') ?? '';
      this.category.set(cat);
      this.slug.set(sl);

      // Reset state on each navigation
      this.page.set(null);
      this.loading.set(true);
      this.error.set(null);

      this.api.getDocPage(cat, sl).subscribe({
        next:  p => { this.page.set(p);                         this.loading.set(false); },
        error: e => { this.error.set(e?.message ?? 'API error'); this.loading.set(false); },
      });
    });
  }
}
