import { Component, input, OnInit, inject, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Declare lucide globally
declare const lucide: any;

@Component({
  selector: 'vertex-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="v-card">
      @if (title()) {
        <div class="v-card-header">
          @if (icon()) {
            <i [attr.data-lucide]="icon()"></i>
          }
          <span>{{ title() }}</span>
        </div>
      }
      <div [class.v-card-body]="padding()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VertexCardComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);

  title = input<string>('');
  icon = input<string>('');
  padding = input<boolean>(true);

  ngAfterViewInit() {
    // Initialize Lucide icons after view init
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons({ nameAttr: 'data-lucide' });
      } catch (e) {
        console.warn('Lucide icons not initialized:', e);
      }
    }
  }
}
