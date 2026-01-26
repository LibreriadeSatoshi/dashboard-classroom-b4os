import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'es'] as const;
type Locale = typeof locales[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Validate and fallback to 'es' if invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'es';
  }

  return {
    locale,
    messages: (await import(`../../i18n/${locale}.json`)).default
  };
});