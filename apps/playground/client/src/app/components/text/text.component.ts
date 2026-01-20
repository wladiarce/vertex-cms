import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto py-12 px-4 prose lg:prose-xl" 
         [innerHTML]="data.content">
    </div>
  `
})
export class TextComponent {
  @Input() data: any;
}