import { Component, output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VertexClientService } from '../../services/vertex-client.service';
import { VertexButtonComponent } from '../ui/vertex-button.component';
import { Upload } from '@vertex/common';

@Component({
  selector: 'vertex-media-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VertexButtonComponent
  ],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2>Choose Media</h2>
          <button class="close-btn" (click)="onClose()" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Filters -->
        <div class="modal-filters">
          <input
            type="text"
            class="v-input"
            placeholder="Search by filename..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onFilterChange()"
          />
          
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

        <!-- Content -->
        <div class="modal-body">
          @if (loading()) {
            <div class="loading-state">
              <p>Loading media...</p>
            </div>
          } @else if (media().length === 0) {
            <div class="empty-state">
              <p>No media files found</p>
            </div>
          } @else {
            <div class="media-grid">
              @for (item of media(); track item._id) {
                <div 
                  class="media-item"
                  [class.selected]="selectedItem()?._id === item._id"
                  (click)="selectItem(item)"
                >
                  <!-- Preview -->
                  <div class="media-preview">
                    @if (item.mimetype.startsWith('image/')) {
                      <img 
                        [src]="item.formats?.thumbnail_300 || item.url" 
                        [alt]="item.alt || item.originalName"
                      />
                    } @else if (item.mimetype.startsWith('video/')) {
                      <div class="media-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    } @else {
                      <div class="media-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <vertex-button (click)="onClose()">
            Cancel
          </vertex-button>
          <vertex-button 
            variant="primary" 
            [disabled]="!selectedItem()"
            (click)="onSelect()"
          >
            Select Media
          </vertex-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-container {
      background: var(--bg-surface);
      border: var(--border-width) solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-depth);
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--border-dim);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-subtle);

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        transition: color 0.2s;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          color: var(--text-main);
        }
      }
    }

    .modal-filters {
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--border-dim);
      display: grid;
      grid-template-columns: 1fr 200px;
      gap: 1rem;
    }

    .modal-body {
      padding: 1.5rem 2rem;
      overflow-y: auto;
      flex: 1;
      min-height: 300px;
    }

    .modal-footer {
      padding: 1rem 2rem;
      border-top: 1px solid var(--border-dim);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background: var(--bg-subtle);
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--text-muted);

      p {
        margin: 0;
      }
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
    }

    .media-item {
      background: var(--bg-surface);
      border: var(--border-width) solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        box-shadow: var(--shadow-depth);
        transform: translateY(-2px);
      }

      &.selected {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary);
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
      padding: 0.75rem;
      border-top: 1px solid var(--border-dim);

      .media-filename {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `]
})
export class VertexMediaPickerComponent implements OnInit {
  private vertexClient = inject(VertexClientService);

  // Outputs
  close = output<void>();
  select = output<Upload>();

  // State
  media = signal<Upload[]>([]);
  loading = signal(true);
  searchTerm = '';
  selectedType = '';
  selectedItem = signal<Upload | null>(null);

  ngOnInit() {
    this.loadMedia();
  }

  loadMedia() {
    this.loading.set(true);
    this.vertexClient
      .getMedia(
        1,
        50, // Show more items in picker
        this.selectedType || undefined,
        this.searchTerm || undefined
      )
      .subscribe({
        next: (response) => {
          this.media.set(response.data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading media:', err);
          this.loading.set(false);
        }
      });
  }

  onFilterChange() {
    this.loadMedia();
  }

  selectItem(item: Upload) {
    this.selectedItem.set(item);
  }

  onSelect() {
    const item = this.selectedItem();
    if (item) {
      this.select.emit(item);
    }
  }

  onClose() {
    this.close.emit();
  }
}
