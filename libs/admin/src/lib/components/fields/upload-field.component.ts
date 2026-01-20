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
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label || field.name }}
      </label>

      @if (previewUrl()) {
        <div class="relative group w-48 h-48 border rounded-lg overflow-hidden mb-2 bg-gray-50">
          <img [src]="previewUrl()" class="w-full h-full object-cover">
          
          <button type="button" (click)="removeFile()"
                  class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      }

      @if (!previewUrl()) {
        <div class="flex items-center justify-center w-full">
          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg class="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span></p>
            </div>
            <input type="file" class="hidden" (change)="onFileSelected($event)">
          </label>
        </div>
      }

      @if (uploading()) {
        <p class="text-sm text-blue-500 mt-2">Uploading...</p>
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
    // this.http.post<any>('/api/vertex/upload', formData).subscribe({
    //   next: (res) => {
    //     // Save the full object (url, filename, size) or just URL depending on your preference.
    //     // For simplicity, let's just save the URL string for now, or the object if Schema allows Mixed.
    //     // Let's assume we save the object to keep metadata.
    //     this.control?.setValue(res); 
    //     this.control?.markAsDirty();
    //     this.uploading.set(false);
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.uploading.set(false);
    //     alert('Upload failed');
    //   }
    // });
  }

  removeFile() {
    this.control?.setValue(null);
    this.control?.markAsDirty();
  }
}