import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CmsFetchService } from '@vertex-cms/public';
import { LocaleConfiguration, resolveLocalizedValue } from '@vertex-cms/common';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private cms = inject(CmsFetchService);
  
  private config = signal<LocaleConfiguration | null>(null);
  private currentLocale = signal<string>('en');

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    this.cms.get<LocaleConfiguration>('/api/vertex/config/locales')
      .subscribe({
        next: (config) => {
          this.config.set(config);
          this.currentLocale.set(config.default);
        },
        error: (err) => {
          console.error('Failed to load locale configuration:', err);
          this.config.set({ default: 'en', supported: ['en'] });
        }
      });
  }

  getCurrentLocale() {
    return this.currentLocale.asReadonly();
  }

  getDefaultLocale() {
    return this.config()?.default || 'en';
  }

  setCurrentLocale(locale: string) {
    this.currentLocale.set(locale);
  }

  /**
   * Translate a localized field value
   */
  translate(value: Record<string, string> | string | undefined | null, fallback?: string): string {
    return resolveLocalizedValue(
      value,
      this.currentLocale(),
      this.getDefaultLocale(),
      fallback
    );
  }
}
