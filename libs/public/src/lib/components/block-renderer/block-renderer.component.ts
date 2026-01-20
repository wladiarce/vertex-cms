import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VertexRegistryService } from '../../services/vertex-registry.service';

@Component({
  selector: 'vertex-block-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (block of blocks; track $index) {
      @if (getComponent(block.blockType); as Comp) {
        <ng-container *ngComponentOutlet="Comp; inputs: { data: block }" />
      } @else {
        <div class="p-8 border-2 border-dashed border-red-300 bg-red-50 text-red-600 text-center m-4 rounded">
          <strong>Missing Component:</strong> No component registered for block type <code>{{ block.blockType }}</code>.
        </div>
      }
    }
  `
})
export class BlockRendererComponent {
  @Input() blocks: any[] = []; // The JSON array from the API

  private registry = inject(VertexRegistryService);

  getComponent(type: string) {
    return this.registry.get(type);
  }
}