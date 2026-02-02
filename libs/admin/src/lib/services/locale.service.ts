import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocaleConfiguration } from '@vertex/common';

/**
 * Service to manage locale state in the Admin UI
 * Fetches locale configuration from the backend API
 * Provides current locale, supported locales, and methods to switch between them
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private http = inject(HttpClient);
  
  // Locale configuration fetched from API
  private config = signal<LocaleConfiguration | null>(null);
  
  // Current locale for the admin interface
  private currentLocale = signal<string>('en');

  constructor() {
    this.loadConfig();
  }

  /**
   * Load locale configuration from backend
   */
  private loadConfig() {
    this.http.get<LocaleConfiguration>('/api/vertex/config/locales')
      .subscribe({
        next: (config) => {
          this.config.set(config);
          this.currentLocale.set(config.default);
        },
        error: (err) => {
          console.error('Failed to load locale configuration:', err);
          // Fallback to default
          this.config.set({ default: 'en', supported: ['en'] });
        }
      });
  }

  /**
   * Get the current locale as a signal
   */
  getCurrentLocale() {
    return this.currentLocale.asReadonly();
  }

  /**
   * Get supported locales as a computed signal
   */
  getSupportedLocales() {
    return computed(() => this.config()?.supported || ['en']);
  }

  /**
   * Get default locale
   */
  getDefaultLocale() {
    return this.config()?.default || 'en';
  }

  /**
   * Set the current locale
   * Validates that locale is in supported list
   */
  setCurrentLocale(locale: string) {
    const supported = this.config()?.supported || [];
    if (supported.includes(locale)) {
      this.currentLocale.set(locale);
    } else {
      console.warn(`Locale '${locale}' is not supported. Using default.`);
      this.currentLocale.set(this.getDefaultLocale());
    }
  }

  /**
   * Get locale display name
   */
  getLocaleName(locale: string): string {
    const names = this.config()?.names;
    return names?.[locale] || locale.toUpperCase();
  }
}
