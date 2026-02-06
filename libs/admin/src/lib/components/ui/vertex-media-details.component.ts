import { Component, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Upload } from '@vertex/common';
import { VertexButtonComponent } from './vertex-button.component';
import { VertexInputComponent } from './vertex-input.component';
import { VertexCardComponent } from './vertex-card.component';

@Component({
  selector: 'vertex-media-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VertexButtonComponent,
    VertexInputComponent,
    VertexCardComponent
  ],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2>Media Details</h2>
          <button class="close-btn" (click)="onClose()" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="modal-body">
          <div class="details-grid">
            <!-- Left: Preview -->
            <div class="preview-section">
              @if (mediaItem().mimetype.startsWith('image/')) {
                <div class="image-preview">
                  <img 
                    [src]="mediaItem().url" 
                    [alt]="mediaItem().alt || mediaItem().originalName"
                  />
                </div>
              } @else if (mediaItem().mimetype.startsWith('video/')) {
                <div class="file-icon-preview">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <p>Video File</p>
                </div>
              } @else {
                <div class="file-icon-preview">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <p>Document</p>
                </div>
              }

              <!-- Quick Actions -->
              <div class="preview-actions">
                <vertex-button 
                  size="sm" 
                  (click)="copyUrl()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                  Copy URL
                </vertex-button>
                
                <a 
                  [href]="mediaItem().url" 
                  target="_blank"
                  class="v-btn sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path>
                    <path d="m21 3-9 9"></path>
                    <path d="M15 3h6v6"></path>
                  </svg>
                  Open Original
                </a>
              </div>
            </div>

            <!-- Right: Form & Info -->
            <div class="info-section">
              <!-- Metadata Form -->
              <vertex-card>
                <div class="card-section">
                  <h3 class="section-title">Metadata</h3>
                  
                  <form [formGroup]="metadataForm" (ngSubmit)="onSave()">
                    <div class="form-fields">
                      <vertex-input
                        label="Alt Text"
                        type="text"
                        placeholder="Describe this image for accessibility"
                        formControlName="alt"
                      />
                      
                      <vertex-input
                        label="Caption"
                        type="textarea"
                        placeholder="Add a caption"
                        formControlName="caption"
                        [rows]="3"
                      />
                    </div>

                    <div class="form-actions">
                      <vertex-button
                        type="submit"
                        variant="primary"
                        [disabled]="!metadataForm.dirty || saving()"
                      >
                        {{ saving() ? 'Saving...' : 'Save Changes' }}
                      </vertex-button>
                      
                      @if (metadataForm.dirty) {
                        <vertex-button
                          type="button"
                          (click)="resetForm()"
                        >
                          Reset
                        </vertex-button>
                      }
                    </div>
                  </form>
                </div>
              </vertex-card>

              <!-- File Information -->
              <vertex-card>
                <div class="card-section">
                  <h3 class="section-title">File Information</h3>
                  
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Filename</span>
                      <span class="info-value">{{ mediaItem().originalName }}</span>
                    </div>
                    
                    <div class="info-item">
                      <span class="info-label">Type</span>
                      <span class="info-value">{{ mediaItem().mimetype }}</span>
                    </div>
                    
                    <div class="info-item">
                      <span class="info-label">Size</span>
                      <span class="info-value">{{ formatFileSize(mediaItem().size) }}</span>
                    </div>
                    
                    @if (mediaItem().width && mediaItem().height) {
                      <div class="info-item">
                        <span class="info-label">Dimensions</span>
                        <span class="info-value">{{ mediaItem().width }} × {{ mediaItem().height }}px</span>
                      </div>
                    }
                    
                    @if (mediaItem().createdAt) {
                      <div class="info-item">
                        <span class="info-label">Uploaded</span>
                        <span class="info-value">{{ formatDate(mediaItem().createdAt!) }}</span>
                      </div>
                    }
                    
                    <div class="info-item full-width">
                      <span class="info-label">URL</span>
                      <span class="info-value mono truncate">{{ mediaItem().url }}</span>
                    </div>
                  </div>
                </div>
              </vertex-card>

              <!-- Available Formats -->
              @if (mediaItem().formats && Object.keys(mediaItem().formats!).length > 0) {
                <vertex-card>
                  <div class="card-section">
                    <h3 class="section-title">Available Formats</h3>
                    
                    <div class="formats-list">
                      @for (format of getFormats(); track format.key) {
                        <div class="format-item">
                          <span class="format-label">{{ formatLabel(format.key) }}</span>
                          <button 
                            type="button"
                            class="format-copy"
                            (click)="copyFormatUrl(format.url)"
                            title="Copy URL"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </vertex-card>
              }
            </div>
          </div>
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
      overflow-y: auto;
    }

    .modal-container {
      background: var(--bg-surface);
      border: var(--border-width) solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-depth);
      max-width: 1200px;
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

    .modal-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 2rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .preview-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .image-preview {
      background: var(--bg-subtle);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
      overflow: hidden;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .file-icon-preview {
      background: var(--bg-subtle);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: var(--text-muted);

      p {
        margin: 0;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        text-transform: uppercase;
      }
    }

    .preview-actions {
      display: flex;
      gap: 0.75rem;

      a {
        text-decoration: none;
      }
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-section {
      padding: 1.5rem;

      .section-title {
        margin: 0 0 1.5rem 0;
        font-family: var(--font-mono);
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        &.full-width {
          grid-column: 1 / -1;
        }

        .info-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }

        .info-value {
          font-size: 0.9rem;
          color: var(--text-main);

          &.mono {
            font-family: var(--font-mono);
            font-size: 0.8rem;
          }

          &.truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    .formats-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .format-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: var(--bg-subtle);
        border: 1px solid var(--border-dim);
        border-radius: var(--radius);

        .format-label {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .format-copy {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;

          &:hover {
            color: var(--primary);
          }
        }
      }
    }
  `]
})
export class VertexMediaDetailsComponent {
  private fb = inject(FormBuilder);

  // Inputs/Outputs
  mediaItem = input.required<Upload>();
  close = output<void>();
  save = output<{ alt?: string; caption?: string }>();

  // State
  saving = signal(false);
  metadataForm!: FormGroup;

  constructor() {
    // Initialize form
    this.metadataForm = this.fb.group({
      alt: [''],
      caption: ['']
    });

    // Effect to update form when mediaItem changes
    effect(() => {
      const item = this.mediaItem();
      this.metadataForm.patchValue({
        alt: item.alt || '',
        caption: item.caption || ''
      }, { emitEvent: false });
      this.metadataForm.markAsPristine();
      
      // Reset saving state when item changes (indicates save completed)
      this.saving.set(false);
    });
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.metadataForm.invalid || !this.metadataForm.dirty) return;

    const formValue = this.metadataForm.value;
    this.saving.set(true);

    // Emit save event with form data
    this.save.emit({
      alt: formValue.alt || undefined,
      caption: formValue.caption || undefined
    });
  }

  resetForm() {
    const item = this.mediaItem();
    this.metadataForm.patchValue({
      alt: item.alt || '',
      caption: item.caption || ''
    });
    this.metadataForm.markAsPristine();
  }

  copyUrl() {
    navigator.clipboard.writeText(window.location.origin + this.mediaItem().url);
    alert('URL copied to clipboard!');
  }

  copyFormatUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    alert('Format URL copied to clipboard!');
  }

  getFormats(): { key: string; url: string }[] {
    const formats = this.mediaItem().formats;
    if (!formats) return [];

    return Object.entries(formats).map(([key, url]) => ({ key, url: url as string }));
  }

  formatLabel(key: string): string {
    const labels: Record<string, string> = {
      thumbnail_150: 'Thumbnail 150×150',
      thumbnail_300: 'Thumbnail 300×300',
      sm: 'Small (640px)',
      md: 'Medium (768px)',
      lg: 'Large (1024px)',
      xl: 'Extra Large (1280px)'
    };
    return labels[key] || key;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Expose Object.keys for template
  Object = Object;
}
