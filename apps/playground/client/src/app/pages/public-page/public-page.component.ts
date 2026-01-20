import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BlockRendererComponent } from '@vertex/public';
import { map } from 'rxjs';

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CommonModule, BlockRendererComponent],
  template: `
    @if (pageData(); as page) {
      <vertex-block-renderer [blocks]="page.layout" />
    } @else {
      <div class="text-center py-20">Loading...</div>
    }
  `
})
export class PublicPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  pageData = signal<any>(null);

  ngOnInit() {
    // 1. Get the slug from the URL (or default to 'home')
    this.route.url.subscribe(segments => {
      const slug = segments.length ? segments.join('/') : 'home';
      this.loadPage(slug);
    });
  }

  loadPage(slug: string) {
    // 2. Query the API
    this.http.get<any>('/api/content/pages', { params: { slug } })
      .pipe(map(res => { console.log(res); return res.docs[0]; })) // Get the first match
      .subscribe(page => {
        if (page) {
          this.pageData.set(page);
        } else {
          // Handle 404
          console.error('Page not found');
        }
      });
  }
}