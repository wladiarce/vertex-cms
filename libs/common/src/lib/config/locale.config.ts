/**
 * Default locale configuration for VertexCMS
 * Can be overridden via VertexCoreModule.forRoot() options
 */

import { LocaleConfiguration } from '../interfaces/config.interface';

export const DEFAULT_LOCALE_CONFIG: LocaleConfiguration = {
  default: 'en',
  supported: ['en', 'es', 'fr', 'de'],
  names: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch'
  }
};
