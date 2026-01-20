import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-blue-600 text-white py-20 px-4 text-center">
      <h1 class="text-5xl font-bold mb-4">{{ data.headline }}</h1>
      <p class="text-xl opacity-90">{{ data.subheadline }}</p>
    </section>
  `
})
export class HeroComponent {
  @Input() data: any; // Receives the block data from CMS
}