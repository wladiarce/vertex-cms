import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vertex-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses()">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class VertexBadgeComponent {
  status = input<'draft' | 'published' | 'archived'>('draft');

  badgeClasses() {
    const classes = ['v-badge'];
    
    switch (this.status()) {
      case 'published':
        classes.push('status-published');
        break;
      case 'draft':
        classes.push('status-draft');
        break;
      case 'archived':
        classes.push('status-archived');
        break;
    }
    
    return classes.join(' ');
  }
}
