import { defaultLocale, locales, type Locale } from './translations';

// Built from the live `locales` list so adding a language to translations.ts
// is the only edit needed — this regex updates itself, nothing to keep in sync.
const localePrefixPattern = new RegExp(`^/(${locales.join('|')})(/|$)`);

/** Build a same-page link to another locale, preserving the current path. */
export function localizedPath(locale: Locale, path: string): string {
  const cleaned = path.replace(localePrefixPattern, '/');
  const withSlash = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return `/${locale}${withSlash === '/' ? '/' : withSlash}`.replace(/\/+$/, '/') || `/${locale}/`;
}

/** All locales except the current one, for building a language switcher. */
export function otherLocales(current: Locale): Locale[] {
  return locales.filter((l) => l !== current);
}

export { locales, defaultLocale };
export type { Locale };
