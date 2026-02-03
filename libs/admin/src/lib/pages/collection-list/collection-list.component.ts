import { Component, inject, signal, computed, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VertexClientService } from '../../services/vertex-client.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { VertexButtonComponent } from '../../components/ui/vertex-button.component';
import { VertexBadgeComponent } from '../../components/ui/vertex-badge.component';
import { VertexCardComponent } from '../../components/ui/vertex-card.component';

declare const lucide: any;

@Component({
  selector: 'vertex-collection-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, VertexButtonComponent, VertexBadgeComponent, VertexCardComponent],
  template: `
    <div class="p-6 md:p-8">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 class="text-3xl font-bold">{{ collection()?.pluralName }}</h1>
          <p class="text-[var(--text-muted)] text-sm font-mono mt-1">Manage your {{ collection()?.pluralName?.toLowerCase() || collection()?.singularName?.toLowerCase() + 's' }}</p>
        </div>
        <div class="flex gap-2">
          @if (draftsEnabled()) {
            <select [(ngModel)]="selectedStatus" (change)="loadData()" 
                    class="v-input px-3 py-2 text-sm">
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="all">All</option>
            </select>
          }
          <a [routerLink]="['create']">
            <vertex-button [variant]="'primary'" [icon]="'plus'">
              New {{ collection()?.singularName }}
            </vertex-button>
          </a>
        </div>
      </header>

      <vertex-card [padding]="false">
        <table class="v-table">
          <thead>
            <tr>
              @if (draftsEnabled()) {
                <th>Status</th>
              }
              <th>ID</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (doc of documents(); track doc._id) {
              <tr (click)="navigateToEdit(doc._id)">
                @if (draftsEnabled()) {
                  <td>
                    @if (doc.status === 'draft') {
                      <vertex-badge [status]="'draft'">DRAFT</vertex-badge>
                    } @else if (doc.status === 'published') {
                      <vertex-badge [status]="'published'">PUBLISHED</vertex-badge>
                    } @else if (doc.status === 'archived') {
                      <vertex-badge [status]="'archived'">ARCHIVED</vertex-badge>
                    }
                  </td>
                }
                <td class="font-mono text-xs">{{ doc._id }}</td>
                <td class="text-[var(--text-muted)]">{{ doc.createdAt | date }}</td>
                <td>
                  <a [routerLink]="[doc._id]" class="text-[var(--primary)] hover:underline font-medium" (click)="$event.stopPropagation()">Edit</a>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (documents().length === 0) {
          <div class="text-center py-12 text-[var(--text-muted)]">
            No {{ collection()?.pluralName?.toLowerCase() }} found. Create your first one!
          </div>
        }
      </vertex-card>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-[var(--text-muted)] font-mono">
          Showing {{ documents().length }} of {{ totalDocs() }} {{ collection()?.pluralName?.toLowerCase() }}
        </div>
        <div class="flex gap-2">
          <vertex-button 
            [disabled]="currentPage() === 1" 
            (click)="previousPage()"
            [size]="'sm'"
          >
            Previous
          </vertex-button>
          <vertex-button 
            [disabled]="currentPage() >= totalPages()" 
            (click)="nextPage()"
            [size]="'sm'"
          >
            Next
          </vertex-button>
        </div>
      </div>
    </div>
  `
})
export class CollectionListComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private cms = inject(VertexClientService);
  
  slug = signal('');
  documents = signal<any[]>([]);
  currentPage = signal(1);
  totalDocs = signal(0);
  totalPages = signal(0);
  selectedStatus = 'published';
  
  collection = computed(() => this.cms.collections().find(c => c.slug === this.slug()));
  draftsEnabled = computed(() => this.collection()?.drafts !== false);

  constructor() {
    // Watch route params and update slug
    this.route.paramMap.pipe(
      map(params => params.get('slug') || '')
    ).subscribe(slug => {
      this.slug.set(slug);
    });

    // Load data whenever slug changes
    effect(() => {
      const currentSlug = this.slug();
      if (currentSlug) {
        this.loadData();
      }
    });
  }

  ngAfterViewInit() {
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons({ nameAttr: 'data-lucide' });
      } catch (e) {
        console.warn('Lucide icons not initialized:', e);
      }
    }
  }
  
  loadData() {
    const status = this.draftsEnabled() ? this.selectedStatus : undefined;
    this.cms.getAll(this.slug(), this.currentPage(), 10, status).subscribe(
      (result) => {
        this.documents.set(result.docs);
        this.totalDocs.set(result.totalDocs);
        this.totalPages.set(result.totalPages);
      }
    );
  }
  
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadData();
    }
  }
  
  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadData();
    }
  }
  
  navigateToEdit(id: string) {
    // Navigation handled by click
  }
}