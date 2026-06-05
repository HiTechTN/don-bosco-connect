/**
 * Locale-aware date formatting utility.
 * Returns a human-readable date string for the given locale.
 *
 * @param dateStr - ISO date string or null
 * @param locale  - 'fr' or 'ar' (i18n.language value)
 * @param options - optional overrides (e.g. { month: 'short' })
 */
export function formatDate(
  dateStr: string | null,
  locale: string,
  options?: Intl.DateTimeFormatOptions & { fallback?: string },
): string {
  const { fallback, ...fmtOptions } = options ?? {};
  if (!dateStr) return fallback ?? '';
  const resolvedLocale = locale === 'ar' ? 'ar-TN' : 'fr-FR';
  return new Date(dateStr).toLocaleDateString(resolvedLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...fmtOptions,
  });
}
