import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VertexClientService } from '../../services/vertex-client.service';
import { VertexCardComponent } from '../../components/ui/vertex-card.component';
import { VertexButtonComponent } from '../../components/ui/vertex-button.component';
import { VertexBreadcrumbComponent } from '../../components/ui/vertex-breadcrumb.component';
import { VertexMediaDetailsComponent } from '../../components/ui/vertex-media-details.component';
import { Upload } from '@vertex/common';

@Component({
  selector: 'vertex-media-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VertexCardComponent,
    VertexButtonComponent,
    VertexMediaDetailsComponent
  ],
  template: `
    <div class="media-library-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Media Library</h1>
          <p class="text-muted">Manage all your uploaded files and images</p>
        </div>
        <vertex-button
          variant="primary"
          (click)="triggerUpload()"
        >
        <!-- REPLACE SVG BY ICON -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
          </svg>
          Upload Files
        </vertex-button>
        <input
          #fileInput
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          (change)="handleFileSelect($event)"
          style="display: none;"
        />
      </div>

      <!-- Filters & Search -->
      <vertex-card>
        <div class="filters-section">
          <div class="filter-group">
            <label>Search</label>
            <input
              type="text"
              class="v-input"
              placeholder="Search by filename..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onFilterChange()"
            />
          </div>

          <div class="filter-group">
            <label>Type</label>
            <select
              class="v-select"
              [(ngModel)]="selectedType"
              (ngModelChange)="onFilterChange()"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>

          @if (selectedItems().length > 0) {
            <div class="bulk-actions">
              <span class="selected-count">{{ selectedItems().length }} selected</span>
              <vertex-button
                variant="danger"
                size="sm"
                (click)="bulkDelete()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                Delete Selected
              </vertex-button>
            </div>
          }
        </div>
      </vertex-card>

      <!-- Media Grid -->
      @if (loading()) {
        <div class="loading-state">
          <p>Loading media...</p>
        </div>
      } @else if (media().length === 0) {
        <div class="empty-state flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
          <h3>No media files found</h3>
          <p>Upload your first file to get started</p>
        </div>
      } @else {
        <div class="media-grid">
          @for (item of media(); track item._id) {
            <div 
              class="media-item"
              [class.selected]="isSelected(item._id!)"
              (click)="toggleSelection(item._id!)"
            >
              <!-- Selection Checkbox -->
              <div class="selection-checkbox">
                <input
                  type="checkbox"
                  [checked]="isSelected(item._id!)"
                  (click)="$event.stopPropagation()"
                  (change)="toggleSelection(item._id!)"
                />
              </div>

              <!-- Preview -->
              <div class="media-preview">
                @if (item.mimetype.startsWith('image/')) {
                  <img 
                    [src]="item.formats?.thumbnail_300 || item.url" 
                    [alt]="item.alt || item.originalName"
                  />
                } @else if (item.mimetype.startsWith('video/')) {
                  <div class="media-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                } @else {
                  <div class="media-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                }
              </div>

              <!-- Info -->
              <div class="media-info">
                <p class="media-filename" [title]="item.originalName">
                  {{ item.originalName }}
                </p>
                <p class="media-meta">
                  {{ formatFileSize(item.size) }}
                  @if (item.width && item.height) {
                    · {{ item.width }}×{{ item.height }}
                  }
                </p>
              </div>

              <!-- Actions -->
              <div class="media-actions" (click)="$event.stopPropagation()">
                <button
                  class="action-btn"
                  (click)="copyUrl(item.url)"
                  title="Copy URL"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                </button>
                <button
                  class="action-btn"
                  (click)="openDetails(item)"
                  title="View Details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <vertex-button
              size="sm"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)"
            >
              Previous
            </vertex-button>
            
            <span class="page-info">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>

            <vertex-button
              size="sm"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              Next
            </vertex-button>
          </div>
        }
      }

      <!-- Media Details Modal -->
      @if (selectedMedia()) {
        <vertex-media-details
          [mediaItem]="selectedMedia()!"
          (close)="closeDetails()"
          (save)="saveMetadata($event)"
        />
      }
    </div>
  `,
  styles: [`
    .media-library-page {
      // padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.25rem 0;
        font-size: 2rem;
        font-weight: 700;
      }

      .text-muted {
        margin: 0;
        color: var(--text-muted);
      }
    }

    .filters-section {
      display: grid;
      grid-template-columns: 1fr 200px auto;
      gap: 1rem;
      align-items: end;

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--text-muted);
        }
      }

      .bulk-actions {
        display: flex;
        align-items: center;
        gap: 1rem;

        .selected-count {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-muted);
        }
      }
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);

      svg {
        margin-bottom: 1rem;
        color: var(--border-dim);
      }

      h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-main);
      }

      p {
        margin: 0;
      }
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .media-item {
      position: relative;
      background: var(--bg-surface);
      border: var(--border-width) solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        box-shadow: var(--shadow-depth);
        transform: translateY(-2px);

        .media-actions {
          opacity: 1;
        }
      }

      &.selected {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary);
      }
    }

    .selection-checkbox {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      z-index: 10;

      input[type="checkbox"] {
        width: 1.25rem;
        height: 1.25rem;
        cursor: pointer;
      }
    }

    .media-preview {
      aspect-ratio: 1;
      background: var(--bg-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .media-icon {
        color: var(--text-muted);
      }
    }

    .media-info {
      padding: 1rem;
      border-top: 1px solid var(--border-dim);

      .media-filename {
        margin: 0 0 0.25rem 0;
        font-weight: 600;
        font-size: 0.85rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .media-meta {
        margin: 0;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .media-actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;

      .action-btn {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--primary-fg);
        }
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;

      .page-info {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--text-muted);
      }
    }
  `]
})
export class MediaLibraryComponent implements OnInit {
  private vertexClient = inject(VertexClientService);

  // State
  media = signal<Upload[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  selectedType = '';
  selectedItems = signal<string[]>([]);
  selectedMedia = signal<Upload | null>(null);

  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Images', value: 'image' },
    { label: 'Videos', value: 'video' },
    { label: 'Documents', value: 'document' }
  ];

  ngOnInit() {
    this.loadMedia();
  }

  loadMedia() {
    this.loading.set(true);
    this.vertexClient
      .getMedia(
        this.currentPage(),
        24,
        this.selectedType || undefined,
        this.searchTerm || undefined
      )
      .subscribe({
        next: (response) => {
          this.media.set(response.data);
          this.totalPages.set(response.meta.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading media:', err);
          this.loading.set(false);
        }
      });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadMedia();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadMedia();
  }

  triggerUpload() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    
    // Upload each file
    files.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);

      this.vertexClient.upload(formData).subscribe({
        next: () => {
          console.log('File uploaded:', file.name);
          this.loadMedia(); // Reload the grid
        },
        error: (err) => console.error('Upload failed:', err)
      });
    });

    // Clear the input
    input.value = '';
  }

  toggleSelection(id: string) {
    const current = this.selectedItems();
    const index = current.indexOf(id);
    
    if (index > -1) {
      this.selectedItems.set(current.filter(item => item !== id));
    } else {
      this.selectedItems.set([...current, id]);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedItems().includes(id);
  }

  bulkDelete() {
    if (!confirm(`Delete ${this.selectedItems().length} file(s)?`)) return;

    this.vertexClient.bulkDeleteMedia(this.selectedItems()).subscribe({
      next: () => {
        console.log('Files deleted');
        this.selectedItems.set([]);
        this.loadMedia();
      },
      error: (err) => console.error('Delete failed:', err)
    });
  }

  copyUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    alert('URL copied to clipboard!');
  }

  openDetails(item: Upload) {
    this.selectedMedia.set(item);
  }

  closeDetails() {
    this.selectedMedia.set(null);
  }

  saveMetadata(metadata: { alt?: string; caption?: string }) {
    const currentMedia = this.selectedMedia();
    if (!currentMedia?._id) return;

    this.vertexClient.updateMedia(currentMedia._id, metadata).subscribe({
      next: (updatedMedia) => {
        console.log('Metadata saved successfully');
        
        // Update the media item in the grid
        const updatedList = this.media().map(item => 
          item._id === updatedMedia._id ? updatedMedia : item
        );
        this.media.set(updatedList);
        
        // Update the selected media to reflect changes
        this.selectedMedia.set(updatedMedia);
        
        alert('Metadata saved successfully!');
      },
      error: (err) => {
        console.error('Error saving metadata:', err);
        alert('Failed to save metadata. Please try again.');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
