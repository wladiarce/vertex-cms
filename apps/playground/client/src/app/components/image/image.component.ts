import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule, ],
  template: `
    <figure class="max-w-4xl mx-auto py-8 px-4">
      <img [src]="src" class="w-full rounded-lg shadow-lg">
      @if (data.caption) {
        <figcaption class="text-center text-gray-500 mt-2">
          {{ data.caption }}
        </figcaption>
      }
    </figure>
  `
})
export class ImageComponent {
  @Input() data: any;

  get src() {
    return this.data.image?.url || this.data.image;
  }
}