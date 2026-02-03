import { Component, OnInit, inject, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MoonIcon, SunIcon, } from 'lucide-angular';

declare const lucide: any;

@Component({
  selector: 'vertex-theme-toggle',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button class="v-btn w-full" (click)="toggleTheme()" type="button">
      <i-lucide [img]="currentTheme() === 'dark' ? SunIcon : MoonIcon"></i-lucide>
      Toggle Theme
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
      width: 100%;
    }
  `]
})
export class VertexThemeToggleComponent implements OnInit {
  currentTheme = signal<'light' | 'dark'>('light');

  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;


  ngOnInit() {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('vertex-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('vertex-theme', newTheme);
  }

  private applyTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }
}
