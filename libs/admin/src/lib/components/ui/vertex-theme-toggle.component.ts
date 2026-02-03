import { Component, OnInit, AfterViewInit, inject, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const lucide: any;

@Component({
  selector: 'vertex-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="v-btn" (click)="toggleTheme()" type="button">
      <i [attr.data-lucide]="currentTheme() === 'dark' ? 'sun' : 'moon'"></i>
      Toggle Theme
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class VertexThemeToggleComponent implements OnInit, AfterViewInit {
  private elementRef = inject(ElementRef);
  currentTheme = signal<'light' | 'dark'>('light');

  ngOnInit() {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('vertex-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    }
  }

  ngAfterViewInit() {
    this.initializeIcons();
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('vertex-theme', newTheme);
    
    // Re-initialize icons after theme change
    setTimeout(() => this.initializeIcons(), 50);
  }

  private applyTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }

  private initializeIcons() {
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons({ nameAttr: 'data-lucide' });
      } catch (e) {
        console.warn('Lucide icons not initialized:', e);
      }
    }
  }
}
