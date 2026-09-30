import copy from './collector-copy.json' with { type: 'json' };
export const supportedLocales = ['en','fr','es','it','de','ja','zh'];
export const validLocale = locale => supportedLocales.includes(locale) ? locale : 'en';
export function collectorText(locale, text, values = {}) {
 const translated = copy[text]?.[validLocale(locale)] || text;
 return translated.replace(/\{(\w+)\}/g, (match,key) => String(values[key] ?? match));
}
