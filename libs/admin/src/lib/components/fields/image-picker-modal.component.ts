import {
  Component,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Upload, UploadFormats } from '@vertex-cms/common';
import { VertexMediaPickerComponent } from '../ui/vertex-media-picker.component';

export interface ImageSelection {
  src: string;
  alt: string;
}

/** Keys from UploadFormats plus the original upload URL. */
type ImageSize =
  | 'thumbnail_150'
  | 'thumbnail_300'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'original';

interface SizeOption {
  key: ImageSize;
  label: string;
  description: string;
}

const SIZE_OPTIONS: SizeOption[] = [
  { key: 'thumbnail_150', label: 'Thumbnail (150px)',   description: 'Very small preview' },
  { key: 'thumbnail_300', label: 'Small (300px)',       description: 'Compact image' },
  { key: 'sm',            label: 'Small (640px)',       description: 'Good for columns' },
  { key: 'md',            label: 'Medium (768px)',      description: 'Good for narrow content' },
  { key: 'lg',            label: 'Large (1024px)',      description: 'Recommended for body text' },
  { key: 'xl',            label: 'Extra large (1280px)',description: 'Near full-width' },
  { key: 'original',      label: 'Original',            description: 'Full resolution' },
];

type Tab = 'library' | 'url';
type LibraryStep = 'pick' | 'size';

@Component({
  selector: 'vertex-image-picker-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, VertexMediaPickerComponent],
  template: `
    <div class="ipm-backdrop" (click)="onClose()">
      <div class="ipm-container" (click)="$event.stopPropagation()">

        <!-- ── Header ──────────────────────────────────────────────────── -->
        <div class="ipm-header">
          <div class="ipm-title-row">
            @if (activeTab() === 'library' && libraryStep() === 'size') {
              <button type="button" class="ipm-back-btn" (click)="backToPick()" title="Back to media library">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>
            }
            <h2 class="ipm-title">
              @if (activeTab() === 'library' && libraryStep() === 'size') {
                Choose Image Size
              } @else {
                Insert Image
              }
            </h2>
          </div>
          <button type="button" class="ipm-close-btn" (click)="onClose()" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <!-- ── Tabs ───────────────────────────────────────────────────── -->
        @if (libraryStep() === 'pick') {
          <div class="ipm-tabs">
            <button type="button" class="ipm-tab" [class.ipm-tab--active]="activeTab() === 'library'"
                    (click)="setTab('library')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              From Library
            </button>
            <button type="button" class="ipm-tab" [class.ipm-tab--active]="activeTab() === 'url'"
                    (click)="setTab('url')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              From URL
            </button>
          </div>
        }

        <!-- ── Body ───────────────────────────────────────────────────── -->
        <div class="ipm-body">

          <!-- From Library: pick step → renders VertexMediaPickerComponent inline -->
          @if (activeTab() === 'library' && libraryStep() === 'pick') {
            <div class="ipm-library">
              <vertex-media-picker
                [immediateSelect]="true"
                [filterType]="'image'"
                (select)="onMediaPicked($event)"
              />
            </div>
          }

          <!-- From Library: size step -->
          @if (activeTab() === 'library' && libraryStep() === 'size') {
            <div class="ipm-size-step">
              <!-- Preview card -->
              <div class="ipm-preview-card">
                <div class="ipm-preview-img-wrap">
                  <img
                    [src]="pickedMedia()?.formats?.thumbnail_300 || pickedMedia()?.url"
                    [alt]="pickedMedia()?.alt || pickedMedia()?.originalName"
                    class="ipm-preview-img"
                  />
                </div>
                <div class="ipm-preview-meta">
                  <p class="ipm-preview-name">{{ pickedMedia()?.originalName }}</p>
                  @if (pickedMedia()?.width && pickedMedia()?.height) {
                    <p class="ipm-preview-dims">{{ pickedMedia()?.width }} × {{ pickedMedia()?.height }}px</p>
                  }
                </div>
              </div>

              <!-- Size options -->
              <div class="ipm-size-label">Select a size to insert:</div>
              <div class="ipm-size-grid">
                @for (opt of availableSizes(); track opt.key) {
                  <button
                    type="button"
                    class="ipm-size-opt"
                    [class.ipm-size-opt--selected]="selectedSize() === opt.key"
                    (click)="selectedSize.set(opt.key)"
                  >
                    <span class="ipm-size-opt-label">{{ opt.label }}</span>
                    <span class="ipm-size-opt-desc">{{ opt.description }}</span>
                  </button>
                }
              </div>

              <!-- Alt text override -->
              <div class="ipm-field-row">
                <label class="ipm-label">Alt text</label>
                <input
                  type="text"
                  class="ipm-input"
                  placeholder="Describe the image for accessibility..."
                  [(ngModel)]="libraryAlt"
                />
              </div>
            </div>
          }

          <!-- From URL tab -->
          @if (activeTab() === 'url') {
            <div class="ipm-url-step">
              <div class="ipm-field-row">
                <label class="ipm-label">Image URL</label>
                <input
                  type="url"
                  class="ipm-input"
                  placeholder="https://example.com/image.webp"
                  [(ngModel)]="urlSrc"
                  (ngModelChange)="onUrlSrcChange($event)"
                  (keydown.enter)="submitUrl()"
                />
              </div>
              <div class="ipm-field-row">
                <label class="ipm-label">Alt text</label>
                <input
                  type="text"
                  class="ipm-input"
                  placeholder="Describe the image..."
                  [(ngModel)]="urlAlt"
                  (keydown.enter)="submitUrl()"
                />
              </div>
              @if (urlPreviewSrc()) {
                <div class="ipm-url-preview">
                  <img [src]="urlPreviewSrc()" alt="URL preview" class="ipm-url-preview-img" (error)="onPreviewError()" />
                </div>
              }
            </div>
          }
        </div>

        <!-- ── Footer ─────────────────────────────────────────────────── -->
        <div class="ipm-footer">
          <button type="button" class="ipm-btn ipm-btn--ghost" (click)="onClose()">Cancel</button>

          @if (activeTab() === 'library') {
            @if (libraryStep() === 'size') {
              <button
                type="button"
                class="ipm-btn ipm-btn--primary"
                [disabled]="!selectedSize()"
                (click)="insertFromLibrary()"
              >
                Insert Image
              </button>
            }
          } @else {
            <button
              type="button"
              class="ipm-btn ipm-btn--primary"
              [disabled]="!urlSrc.trim()"
              (click)="submitUrl()"
            >
              Insert Image
            </button>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Backdrop & container ─────────────────────────────────────────── */
    .ipm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 2rem;
    }

    .ipm-container {
      background: var(--bg-surface);
      border: var(--border-width) solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-depth);
      width: 100%;
      max-width: 860px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Header ────────────────────────────────────────────────────────── */
    .ipm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.75rem;
      background: var(--bg-subtle);
      border-bottom: 1px solid var(--border-dim);
      flex-shrink: 0;
    }

    .ipm-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .ipm-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .ipm-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.6rem;
      background: none;
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      font-family: var(--font-mono);
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.12s;
      &:hover { color: var(--text-main); border-color: var(--border); }
    }

    .ipm-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      transition: color 0.15s;
      &:hover { color: var(--text-main); }
    }

    /* ── Tabs ──────────────────────────────────────────────────────────── */
    .ipm-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-dim);
      background: var(--bg-subtle);
      flex-shrink: 0;
    }

    .ipm-tab {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.65rem 1.25rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.15s;
      margin-bottom: -1px;

      &:hover { color: var(--text-main); }

      &--active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
    }

    /* ── Body ──────────────────────────────────────────────────────────── */
    .ipm-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    /* Library step: constrains height so it fits inside the modal body */
    .ipm-library {
      height: 420px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      vertex-media-picker {
        display: contents;
      }
    }

    /* Size-pick step */
    .ipm-size-step {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .ipm-preview-card {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
    }

    .ipm-preview-img-wrap {
      width: 64px;
      height: 64px;
      border-radius: 2px;
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid var(--border-dim);
    }

    .ipm-preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ipm-preview-meta {
      flex: 1;
      overflow: hidden;
    }

    .ipm-preview-name {
      margin: 0 0 0.2rem;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ipm-preview-dims {
      margin: 0;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .ipm-size-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .ipm-size-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.5rem;
    }

    .ipm-size-opt {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.65rem 0.85rem;
      background: var(--bg-input);
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      text-align: left;
      cursor: pointer;
      transition: all 0.12s;

      &:hover { border-color: var(--border); }

      &--selected {
        border-color: var(--primary);
        background: color-mix(in srgb, var(--primary) 8%, var(--bg-input));
        .ipm-size-opt-label { color: var(--primary); }
      }
    }

    .ipm-size-opt-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .ipm-size-opt-desc {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    /* URL step */
    .ipm-url-step {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ipm-url-preview {
      background: var(--bg-subtle);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
    }

    .ipm-url-preview-img {
      max-width: 100%;
      max-height: 240px;
      border-radius: 2px;
      object-fit: contain;
    }

    /* Shared inputs */
    .ipm-field-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .ipm-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .ipm-input {
      height: 36px;
      padding: 0 0.75rem;
      font-size: 0.9rem;
      background: var(--bg-input);
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      color: var(--text-main);
      outline: none;
      width: 100%;
      box-sizing: border-box;
      &:focus { border-color: var(--primary); }
    }

    /* ── Footer ─────────────────────────────────────────────────────────── */
    .ipm-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.75rem;
      border-top: 1px solid var(--border-dim);
      background: var(--bg-subtle);
      flex-shrink: 0;
    }

    .ipm-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      height: 34px;
      padding: 0 1.1rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.12s;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &--ghost {
        background: none;
        border: 1px solid var(--border-dim);
        color: var(--text-muted);
        &:hover:not(:disabled) { color: var(--text-main); border-color: var(--border); }
      }

      &--primary {
        background: var(--primary);
        border: 1px solid var(--primary);
        color: #fff;
        &:hover:not(:disabled) { filter: brightness(1.1); }
      }
    }
  `],
})
export class ImagePickerModalComponent {
  // ── Outputs ────────────────────────────────────────────────────────────
  imageSelected = output<ImageSelection>();
  closed = output<void>();

  // ── Tab state ──────────────────────────────────────────────────────────
  activeTab = signal<Tab>('library');
  libraryStep = signal<LibraryStep>('pick');

  // ── Library step state ─────────────────────────────────────────────────
  pickedMedia = signal<Upload | null>(null);
  selectedSize = signal<ImageSize | null>(null);
  libraryAlt = '';

  // ── URL step state ──────────────────────────────────────────────────────
  urlSrc = '';
  urlAlt = '';
  urlPreviewSrc = signal('');

  // ── Computed: which size options are available for the picked media ─────
  availableSizes = computed<SizeOption[]>(() => {
    const m = this.pickedMedia();
    if (!m) return [];
    return SIZE_OPTIONS.filter(opt => {
      if (opt.key === 'original') return true; // always available
      return !!(m.formats as UploadFormats | undefined)?.[opt.key as keyof UploadFormats];
    });
  });

  // ── Tab switching ───────────────────────────────────────────────────────
  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.libraryStep.set('pick');
  }

  // ── Library flow ────────────────────────────────────────────────────────
  onMediaPicked(upload: Upload) {
    this.pickedMedia.set(upload);
    this.libraryAlt = upload.alt || upload.originalName;
    this.selectedSize.set(null);

    // Auto-select 'lg' if available, else 'original'
    const available = this.availableSizes();
    const lg = available.find(s => s.key === 'lg');
    this.selectedSize.set(lg ? 'lg' : 'original');

    this.libraryStep.set('size');
  }

  backToPick() {
    this.libraryStep.set('pick');
    this.pickedMedia.set(null);
    this.selectedSize.set(null);
  }

  insertFromLibrary() {
    const media = this.pickedMedia();
    const size = this.selectedSize();
    if (!media || !size) return;

    let src: string;
    if (size === 'original') {
      src = media.url;
    } else {
      src = (media.formats as UploadFormats | undefined)?.[size as keyof UploadFormats] ?? media.url;
    }

    this.imageSelected.emit({ src, alt: this.libraryAlt.trim() });
  }

  // ── URL flow ────────────────────────────────────────────────────────────
  onUrlSrcChange(value: string) {
    this.urlPreviewSrc.set(value.trim());
  }

  submitUrl() {
    const src = this.urlSrc.trim();
    if (!src) return;
    this.imageSelected.emit({ src, alt: this.urlAlt.trim() });
  }

  onPreviewError() {
    this.urlPreviewSrc.set('');
  }

  // ── Close ───────────────────────────────────────────────────────────────
  onClose() {
    this.closed.emit();
  }
}
