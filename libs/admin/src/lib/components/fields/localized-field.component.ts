import { Component, Input, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldOptions, FieldType } from '@vertex/common';
import { LocaleService } from '../../services/locale.service';
import { VertexTabsComponent, VertexTab } from '../ui/vertex-tabs.component';

/**
 * Component for rendering localized fields with locale tabs
 * Allows editing content in multiple languages
 */
@Component({
  selector: 'vertex-localized-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VertexTabsComponent],
  template: `
    <div class="mb-6">
      <!-- Field Label -->
      <div class="v-input-group mb-2">
        <label>
          {{ field.label || field.name }}
          @if (field.required) {
            <span class="text-[var(--primary)]">*</span>
          }
        </label>
      </div>

      <!-- Locale Tabs -->
      <vertex-tabs 
        [tabs]="tabsConfig()" 
        [activeTab]="currentLocale()"
        (activeTabChange)="currentLocale.set($event)"
      >
        <!-- Field Input based on type -->
        <div class="field-input">
          @if (getLocaleControl(currentLocale()); as control) {
            @switch (field.type) {
              @case ('text') {
                <input
                  type="text"
                  [formControl]="control"
                  [placeholder]="field.label + ' (' + currentLocale() + ')'"
                  class="v-input"
                  (input)="onInputChange()"
                />
              }
              @case ('rich-text') {
                <textarea
                  [formControl]="control"
                  [placeholder]="field.label + ' (' + currentLocale() + ')'"
                  rows="6"
                  class="v-input"
                  (input)="onInputChange()"
                ></textarea>
              }
              @default {
                <input
                  type="text"
                  [formControl]="control"
                  [placeholder]="field.label + ' (' + currentLocale() + ')'"
                  class="v-input"
                  (input)="onInputChange()"
                />
              }
            }
          } @else {
            <div class="font-mono text-xs text-[var(--primary)] p-2">
              Form control not initialized for {{ currentLocale() }}
            </div>
          }
        </div>
      </vertex-tabs>

      <!-- Helper text -->
      <p class="mt-2 font-mono text-[10px] text-[var(--text-muted)] uppercase">
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
export class LocalizedFieldComponent implements OnInit {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;

  private localeService = inject(LocaleService);

  // Current locale being edited
  currentLocale = signal<string>(this.localeService.getDefaultLocale());

  // Supported locales from service
  supportedLocales = this.localeService.getSupportedLocales();

  // Track form values reactively - this will trigger computed to re-run
  private formValuesVersion = signal<number>(0);

  // Computed tabs configuration - now reactive to form changes
  tabsConfig = computed<VertexTab[]>(() => {
    // Access the version signal to make this computed reactive to form changes
    this.formValuesVersion();
    
    return this.supportedLocales().map(locale => ({
      id: locale,
      label: this.getLocaleName(locale),
      badge: this.hasTranslation(locale) ? undefined : '!'
    }));
  });

  ngOnInit() {
    // Subscribe to form value changes and bump the version signal
    const localeGroup = this.group.get(this.field.name) as FormGroup;
    if (localeGroup) {
      localeGroup.valueChanges.subscribe(() => {
        this.formValuesVersion.update(v => v + 1);
      });
      
      // Trigger initial update in case form already has values
      this.formValuesVersion.update(v => v + 1);
    }
  }

  /**
   * Called when input changes to trigger reactivity
   */
  onInputChange() {
    this.formValuesVersion.update(v => v + 1);
  }

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
}
