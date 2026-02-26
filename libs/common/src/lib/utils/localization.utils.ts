/**
 * Resolves a localized value based on language priorities.
 * 1. currentLocale
 * 2. defaultLocale
 * 3. Any language available in the object
 * 4. Fallback if everything else fails
 */
export function resolveLocalizedValue(
  localizedValue: Record<string, string> | string | undefined | null,
  currentLocale: string,
  defaultLocale: string = 'en',
  fallback: string = 'Untitled'
): string {
  if (!localizedValue) return fallback;

  // Sometimes, for legacy or uninitialized data, we might receive a string
  if (typeof localizedValue === 'string') return localizedValue;

  // 1. Try provided current locale
  if (localizedValue[currentLocale]) {
    return localizedValue[currentLocale];
  }

  // 2. Try default locale
  if (localizedValue[defaultLocale]) {
    return localizedValue[defaultLocale];
  }

  // 3. Try any available translation (first one alphabetically by language code as a tie-breaker)
  const availableLocales = Object.keys(localizedValue).sort();
  if (availableLocales.length > 0) {
    const firstLocale = availableLocales.find(l => localizedValue[l]?.trim() !== '');
    if (firstLocale) {
      return localizedValue[firstLocale];
    }
  }

  return fallback;
}
