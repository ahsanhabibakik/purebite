import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Fallback to default locale if missing/invalid to support non-localized routes
  const resolvedLocale: Locale = locales.includes(locale as any)
    ? (locale as Locale)
    : defaultLocale;

  return {
  locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
    timeZone: 'Asia/Dhaka',
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'BDT',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      }
    }
  };
});