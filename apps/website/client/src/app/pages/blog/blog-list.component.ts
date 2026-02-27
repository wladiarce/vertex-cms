import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsApiService, BlogPost } from '../../services/cms-api.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent {
  private api = inject(CmsApiService);
  posts = signal<BlogPost[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.api.listBlogPosts().subscribe({
      next: posts => { this.posts.set(posts); this.loading.set(false); },
      error: e => { this.error.set(e?.message ?? 'Failed to load posts'); this.loading.set(false); }
    });
  }
}
