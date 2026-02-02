import { Injectable, Inject, Optional } from '@nestjs/common';
import { LocaleConfiguration, DEFAULT_LOCALE_CONFIG } from '@vertex/common';

/**
 * Provider for accessing locale configuration
 * Injects configuration from module options or uses defaults
 */
@Injectable()
export class LocaleConfigProvider {
  private readonly config: LocaleConfiguration;

  constructor(@Optional() @Inject('LOCALE_CONFIG') config?: LocaleConfiguration) {
    this.config = config || DEFAULT_LOCALE_CONFIG;
  }

  /**
   * Get the default locale
   */
  getDefaultLocale(): string {
    return this.config.default;
  }

  /**
   * Get all supported locales
   */
  getSupportedLocales(): string[] {
    return this.config.supported;
  }

  /**
   * Get display name for a locale
   */
  getLocaleName(locale: string): string {
    return this.config.names?.[locale] || locale.toUpperCase();
  }

  /**
   * Get the full configuration object
   */
  getConfig(): LocaleConfiguration {
    return { ...this.config };
  }

  /**
   * Check if a locale is supported
   */
  isLocaleSupported(locale: string): boolean {
    return this.config.supported.includes(locale);
  }
}
