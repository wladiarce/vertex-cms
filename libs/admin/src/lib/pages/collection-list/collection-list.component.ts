import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VertexClientService } from '../../services/vertex-client.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'vertex-collection-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-8">
      <header class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">{{ collection()?.pluralName }}</h1>
          <p class="text-gray-500 text-sm">Manage your {{ collection()?.pluralName?.toLowerCase() }}</p>
        </div>
        <div class="flex gap-2">
          @if (draftsEnabled()) {
            <select [(ngModel)]="selectedStatus" (change)="loadData()" 
                    class="px-3 py-2 border rounded">
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="all">All</option>
            </select>
          }
          <a [routerLink]="['create']" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + New {{ collection()?.singularName }}
          </a>
        </div>
      </header>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              @if (draftsEnabled()) {
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              }
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (doc of documents(); track doc._id) {
              <tr class="hover:bg-gray-50 cursor-pointer" (click)="navigateToEdit(doc._id)">
                @if (draftsEnabled()) {
                  <td class="px-6 py-4 whitespace-nowrap">
                    @if (doc.status === 'draft') {
                      <span class="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">Draft</span>
                    } @else if (doc.status === 'published') {
                      <span class="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Published</span>
                    } @else if (doc.status === 'archived') {
                      <span class="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">Archived</span>
                    }
                  </td>
                }
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ doc._id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ doc.createdAt | date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a [routerLink]="[doc._id]" class="text-blue-600 hover:text-blue-800" (click)="$event.stopPropagation()">Edit</a>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (documents().length === 0) {
          <div class="text-center py-12 text-gray-500">
            No {{ collection()?.pluralName?.toLowerCase() }} found. Create your first one!
          </div>
        }
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Showing {{ documents().length }} of {{ totalDocs() }} {{ collection()?.pluralName?.toLowerCase() }}
        </div>
        <div class="flex gap-2">
          <button 
            [disabled]="currentPage() === 1" 
            (click)="previousPage()"
            class="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button 
            [disabled]="currentPage() >= totalPages()" 
            (click)="nextPage()"
            class="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  `
})
export class CollectionListComponent {
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