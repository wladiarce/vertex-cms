import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FieldOptions } from '@vertex/common';
import { VertexClientService } from '../../services/vertex-client.service';

@Component({
  selector: 'vertex-upload-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" class="mb-6">
      <div class="v-input-group">
        <label>
          {{ field.label || field.name }}
          @if (field.required) {
            <span class="text-[var(--primary)]">*</span>
          }
        </label>
      </div>

      @if (previewUrl()) {
        <div class="relative group w-48 h-48 border border-[var(--border)] overflow-hidden bg-[var(--bg-subtle)] shadow-[var(--shadow-depth)] transition-shadow hover:shadow-[var(--shadow-hover)]">
          <img [src]="previewUrl()" class="w-full h-full object-cover">
          
          <button type="button" (click)="removeFile()"
                  class="absolute top-2 right-2 bg-[var(--primary)] text-white p-1.5 border border-[var(--border)] shadow-[2px_2px_0px_var(--border)] opacity-0 group-hover:opacity-100 transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      }

      @if (!previewUrl()) {
        <div class="flex items-center justify-center w-full">
          <label class="flex flex-col items-center justify-center w-full h-32 border border-[var(--border)] bg-[var(--bg-surface)] cursor-pointer shadow-[var(--shadow-depth)] transition-all hover:shadow-[var(--shadow-hover)] hover:bg-[var(--bg-subtle)]">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <i data-lucide="upload-cloud" class="w-8 h-8 mb-4 text-[var(--text-muted)]"></i>
              <p class="mb-2 font-mono text-xs text-[var(--text-muted)] uppercase">
                <span class="font-semibold">Click to upload</span>
              </p>
            </div>
            <input type="file" class="hidden" (change)="onFileSelected($event)">
          </label>
        </div>
      }

      @if (uploading()) {
        <p class="font-mono text-xs text-[var(--primary)] mt-2 flex items-center gap-1">
          <i data-lucide="loader" class="w-3 h-3 animate-spin"></i>
          Uploading...
        </p>
      }

      <input type="hidden" [formControlName]="field.name">
    </div>
  `
})
export class UploadFieldComponent {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;

  private clientService = inject(VertexClientService);
//   private http = inject(HttpClient);
  uploading = signal(false);

  // Getter for the current value
  get control() { return this.group.get(this.field.name); }

  // Signal for preview (derived from form value)
  get previewUrl() {
    // If the value is an object (stored JSON), get .url, otherwise it's just the string
    const val = this.control?.value;
    return signal(typeof val === 'object' ? val?.url : val);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.upload(file);
    }
  }

  upload(file: File) {
    this.uploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.clientService.upload(formData).subscribe({
      next: (res) => {
        this.control?.setValue(res); 
        this.control?.markAsDirty();
        this.uploading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.uploading.set(false);
        alert('Upload failed');
      }
    });
  }

  removeFile() {
    this.control?.setValue(null);
    this.control?.markAsDirty();
  }
}