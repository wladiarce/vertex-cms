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
  templateUrl: './pages-demo-page.component.html',
  styleUrl: './pages-demo-page.component.scss'
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
