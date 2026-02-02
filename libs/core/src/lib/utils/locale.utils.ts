import { DEFAULT_LOCALE_CONFIG } from '@vertex/common';

/**
 * Extracts value from localized field object with fallback logic
 * 
 * @param localizedValue - Object like { en: "Hello", es: "Hola" } or a simple value
 * @param locale - Requested locale (e.g., "es")
 * @param defaultLocale - Fallback locale (default: "en")
 * @returns The value in requested locale, fallback locale, or first available value
 * 
 * @example
 * getLocalizedValue({ en: "Hello", es: "Hola" }, "es") // Returns "Hola"
 * getLocalizedValue({ en: "Hello", es: "Hola" }, "fr") // Returns "Hello" (fallback)
 * getLocalizedValue("Simple Value", "es") // Returns "Simple Value" (not localized)
 */
export function getLocalizedValue(
  localizedValue: Record<string, any> | any,
  locale: string,
  defaultLocale: string = DEFAULT_LOCALE_CONFIG.default
): any {
  // If not an object or is an array, return as-is (not a localized field)
  if (!localizedValue || typeof localizedValue !== 'object' || Array.isArray(localizedValue)) {
    return localizedValue;
  }
  
  // Try requested locale (skip if empty string)
  if (localizedValue[locale] !== undefined && localizedValue[locale] !== '') {
    return localizedValue[locale];
  }
  
  // Fallback to default locale
  if (localizedValue[defaultLocale] !== undefined && localizedValue[defaultLocale] !== '') {
    return localizedValue[defaultLocale];
  }
  
  // Last resort: return first available non-empty value
  const firstValue = Object.values(localizedValue).find(val => val !== undefined && val !== '');
  return firstValue || '';
}

/**
 * Sets a value in a localized field object for a specific locale
 * 
 * @param existingValue - Existing locale object or any value
 * @param locale - Target locale (e.g., "es")
 * @param newValue - New value to set for the locale
 * @returns Updated locale object with the new value
 * 
 * @example
 * setLocalizedValue({ en: "Hello" }, "es", "Hola") // Returns { en: "Hello", es: "Hola" }
 * setLocalizedValue("Simple", "en", "Hello") // Returns { en: "Hello" }
 */
export function setLocalizedValue(
  existingValue: Record<string, any> | any,
  locale: string,
  newValue: any
): Record<string, any> {
  // If existing value is a proper object (not array), spread it
  const localeObj = 
    existingValue && 
    typeof existingValue === 'object' && 
    !Array.isArray(existingValue)
      ? { ...existingValue }
      : {};
  
  localeObj[locale] = newValue;
  return localeObj;
}

/**
 * Checks if a value is a localized object (has locale keys)
 * 
 * @param value - Value to check
 * @returns True if the value is a localized object
 */
export function isLocalizedValue(value: any): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  
  // Check if at least one key matches supported locale codes
  const keys = Object.keys(value);
  return keys.some(key => DEFAULT_LOCALE_CONFIG.supported.includes(key));
}
