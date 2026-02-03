import { Component, input, AfterViewInit, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare const lucide: any;

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'vertex-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="v-breadcrumb">
      @for (item of items(); track $index; let last = $last) {
        @if (item.route && !last) {
          <a [routerLink]="item.route">{{ item.label }}</a>
        } @else {
          <span [class.v-breadcrumb-current]="last">{{ item.label }}</span>
        }
        
        @if (!last) {
          <i data-lucide="chevron-right"></i>
        }
      }
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VertexBreadcrumbComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);
  
  items = input<BreadcrumbItem[]>([]);

  ngAfterViewInit() {
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons({ nameAttr: 'data-lucide' });
      } catch (e) {
        console.warn('Lucide icons not initialized:', e);
      }
    }
  }
}
