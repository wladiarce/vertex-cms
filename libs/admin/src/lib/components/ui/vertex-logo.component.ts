import { Component, input, AfterViewInit, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const lucide: any;

@Component({
  selector: 'vertex-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="logoClasses()">
      <div [class]="iconBoxClasses()">
        <i data-lucide="box" class="text-white"></i>
      </div>
      <h1 [class]="titleClasses()">
        Vertex <span class="text-[var(--primary)]">CMS</span>
      </h1>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .icon-box {
      background: var(--primary);
      border: var(--border-width) solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-box.sm {
      width: 2rem;
      height: 2rem;
      box-shadow: 1px 1px 0px var(--border);
    }

    .icon-box.md {
      width: 2.5rem;
      height: 2.5rem;
      box-shadow: 2px 2px 0px var(--border);
    }

    .icon-box.lg {
      width: 3rem;
      height: 3rem;
      box-shadow: 2px 2px 0px var(--border);
    }

    .logo-title {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }

    .logo-title.sm {
      font-size: 1.125rem;
    }

    .logo-title.md {
      font-size: 1.5rem;
    }

    .logo-title.lg {
      font-size: 2rem;
    }
  `]
})
export class VertexLogoComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);
  
  size = input<'sm' | 'md' | 'lg'>('md');

  logoClasses() {
    return 'logo-container';
  }

  iconBoxClasses() {
    return `icon-box ${this.size()}`;
  }

  titleClasses() {
    return `logo-title ${this.size()}`;
  }

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
