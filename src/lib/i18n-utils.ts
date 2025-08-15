import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { type Locale, currencies, dateFormats } from '@/i18n/config';

// Price formatting utility
export function usePrice() {
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const currency = currencies[locale];

  const formatPrice = (amount: number) => {
    if (currency.position === 'before') {
      return `${currency.symbol}${amount.toFixed(0)}`;
    } else {
      return `${amount.toFixed(0)}${currency.symbol}`;
    }
  };

  const formatCurrency = (amount: number) => {
    return format.number(amount, 'currency');
  };

  return {
    formatPrice,
    formatCurrency,
    currency
  };
}

// Date formatting utility
export function useDate() {
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const formatDate = (date: Date | string, style: 'short' | 'long' = 'short') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (locale === 'bn') {
      // Bengali date formatting
      const options: Intl.DateTimeFormatOptions = style === 'long' 
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'short', year: 'numeric' };
      
      return dateObj.toLocaleDateString('bn-BD', options);
    } else {
      return format.dateTime(dateObj, style);
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format.relativeTime(dateObj);
  };

  return {
    formatDate,
    formatRelativeTime
  };
}

// Translation helper with fallback
export function useTypedTranslations() {
  const t = useTranslations();
  
  const translate = (key: string, values?: Record<string, any>) => {
    try {
      return t(key, values);
    } catch (error) {
      console.warn(`Translation key "${key}" not found`);
      return key; // Return the key as fallback
    }
  };

  return translate;
}

// Number formatting utility
export function useNumber() {
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const formatNumber = (number: number) => {
    if (locale === 'bn') {
      return number.toLocaleString('bn-BD');
    } else {
      return format.number(number);
    }
  };

  const formatCompactNumber = (number: number) => {
    if (locale === 'bn') {
      if (number >= 100000) {
        return `${(number / 100000).toFixed(1)}লাখ`;
      } else if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}হাজার`;
      }
      return number.toLocaleString('bn-BD');
    } else {
      return format.number(number, { notation: 'compact' });
    }
  };

  return {
    formatNumber,
    formatCompactNumber
  };
}

// Plural handling utility
export function usePlurals() {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  const plural = (count: number, singular: string, plural?: string) => {
    if (locale === 'bn') {
      // Bengali doesn't have complex plural rules like English
      return count === 1 ? singular : (plural || singular);
    } else {
      return count === 1 ? singular : (plural || `${singular}s`);
    }
  };

  const pluralWithCount = (count: number, singular: string, plural?: string) => {
    const word = plural(count, singular, plural);
    return `${count} ${word}`;
  };

  return {
    plural,
    pluralWithCount
  };
}

// Text direction utility
export function useTextDirection() {
  const locale = useLocale() as Locale;
  
  // For future RTL support
  const isRTL = false; // locale === 'ar' || locale === 'ur' etc.
  const direction = isRTL ? 'rtl' : 'ltr';
  
  return {
    isRTL,
    direction,
    textAlign: isRTL ? 'right' : 'left',
    marginStart: isRTL ? 'ml' : 'mr',
    marginEnd: isRTL ? 'mr' : 'ml',
    paddingStart: isRTL ? 'pl' : 'pr',
    paddingEnd: isRTL ? 'pr' : 'pl'
  };
}

// Validation messages utility
export function useValidation() {
  const t = useTranslations('validation');
  
  const getErrorMessage = (field: string, type: string, values?: Record<string, any>) => {
    const key = `${field}.${type}`;
    try {
      return t(key, values);
    } catch {
      // Fallback to generic error messages
      try {
        return t(`generic.${type}`, values);
      } catch {
        return `${field} ${type}`;
      }
    }
  };

  return {
    getErrorMessage
  };
}

// SEO utility for meta tags
export function useMetadata() {
  const locale = useLocale() as Locale;
  const t = useTranslations('metadata');
  
  const getMetadata = (page: string) => {
    try {
      return {
        title: t(`${page}.title`),
        description: t(`${page}.description`),
        keywords: t(`${page}.keywords`),
        locale,
        alternateLocales: ['en', 'bn'].filter(l => l !== locale)
      };
    } catch {
      return {
        title: 'PureBite',
        description: 'Healthy food delivery',
        keywords: 'food, healthy, organic',
        locale,
        alternateLocales: ['en', 'bn'].filter(l => l !== locale)
      };
    }
  };

  return {
    getMetadata
  };
}