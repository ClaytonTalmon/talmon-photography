import { defaultLocale, locales, type Locale } from './translations';

const localePrefixPattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Build a same-page link to another locale, preserving the current path. */
export function localizedPath(locale: Locale, path: string): string {
  const withoutBase =
    basePath && (path === basePath || path.startsWith(`${basePath}/`))
      ? path.slice(basePath.length) || '/'
      : path;
  const cleaned = withoutBase.replace(localePrefixPattern, '/');
  const withSlash = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  const localized = `${basePath}/${locale}${withSlash === '/' ? '/' : withSlash}`;

  return localized.replace(/\/+$/, '/') || `${basePath}/${locale}/`;
}

/** All locales except the current one, for building a language switcher. */
export function otherLocales(current: Locale): Locale[] {
  return locales.filter((l) => l !== current);
}

export { locales, defaultLocale };
export type { Locale };
