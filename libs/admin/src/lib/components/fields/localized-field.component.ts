import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldOptions, FieldType } from '@vertex/common';
import { LocaleService } from '../../services/locale.service';

/**
 * Component for rendering localized fields with locale tabs
 * Allows editing content in multiple languages
 */
@Component({
  selector: 'vertex-localized-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-6">
      <!-- Field Label -->
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label || field.name }}
        @if (field.required) {
          <span class="text-red-500">*</span>
        }
      </label>

      <!-- Locale Tabs -->
      <div class="flex gap-2 mb-3 border-b border-gray-200">
        @for (locale of supportedLocales(); track locale) {
          <button
            type="button"
            (click)="currentLocale.set(locale)"
            [class]="getTabClasses(locale)"
            class="px-4 py-2 text-sm font-medium transition-colors relative"
          >
            {{ getLocaleName(locale) }}
            
            <!-- Indicator for missing translation -->
            @if (!hasTranslation(locale)) {
              <span class="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" 
                    title="Translation missing"></span>
            }
          </button>
        }
      </div>

      <!-- Field Input based on type -->
      <div class="field-input">
        @if (getLocaleControl(currentLocale()); as control) {
          @switch (field.type) {
            @case ('text') {
              <input
                type="text"
                [formControl]="control"
                [placeholder]="field.label + ' (' + currentLocale() + ')'"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            }
            @case ('rich-text') {
              <textarea
                [formControl]="control"
                [placeholder]="field.label + ' (' + currentLocale() + ')'"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            }
            @default {
              <input
                type="text"
                [formControl]="control"
                [placeholder]="field.label + ' (' + currentLocale() + ')'"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            }
          }
        } @else {
          <div class="text-red-500 text-sm p-2">
            Form control not initialized for {{ currentLocale() }}
          </div>
        }
      </div>

      <!-- Helper text -->
      <p class="mt-1 text-xs text-gray-500">
        This field supports multiple languages. Switch tabs to add translations.
      </p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LocalizedFieldComponent {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;

  private localeService = inject(LocaleService);

  // Current locale being edited
  currentLocale = signal<string>(this.localeService.getDefaultLocale());

  // Supported locales from service
  supportedLocales = this.localeService.getSupportedLocales();

  /**
   * Get the form control for a specific locale
   */
  getLocaleControl(locale: string): FormControl | null {
    const localeGroup = this.group.get(this.field.name) as FormGroup;
    if (!localeGroup) {
      console.error(`FormGroup not found for field: ${this.field.name}`);
      return null;
    }
    
    const control = localeGroup.get(locale);
    if (!control) {
      console.error(`FormControl not found for locale: ${locale} in field: ${this.field.name}`);
      return null;
    }
    
    return control as FormControl;
  }

  /**
   * Check if a locale has a translation (non-empty value)
   */
  hasTranslation(locale: string): boolean {
    const control = this.getLocaleControl(locale);
    return control && control.value && control.value.trim() !== '';
  }

  /**
   * Get locale display name
   */
  getLocaleName(locale: string): string {
    return this.localeService.getLocaleName(locale);
  }

  /**
   * Get CSS classes for locale tab
   */
  getTabClasses(locale: string): string {
    const isActive = this.currentLocale() === locale;
    const baseClasses = 'border-b-2 ';
    
    if (isActive) {
      return baseClasses + 'border-blue-500 text-blue-600';
    }
    
    return baseClasses + 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }
}
