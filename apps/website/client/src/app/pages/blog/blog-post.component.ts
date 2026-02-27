import { Component, inject, signal, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsApiService, BlogPost } from '../../services/cms-api.service';

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? '');
  }
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss'
})
export class BlogPostComponent {
  private api = inject(CmsApiService);
  private route = inject(ActivatedRoute);
  slug = this.route.snapshot.paramMap.get('slug') ?? '';
  post = signal<BlogPost | null>(null);
  loading = signal(true);

  constructor() {
    this.api.getBlogPost(this.slug).subscribe({
      next: p => { this.post.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
