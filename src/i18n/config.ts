export const locales = ['en', 'bn'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'bn';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা'
};

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  bn: 'বং'
};

// RTL languages
export const rtlLocales: Locale[] = [];

// Currency settings per locale
export const currencies: Record<Locale, { code: string; symbol: string; position: 'before' | 'after' }> = {
  en: { code: 'BDT', symbol: '৳', position: 'before' },
  bn: { code: 'BDT', symbol: '৳', position: 'before' }
};

// Date format settings per locale
export const dateFormats: Record<Locale, { short: string; long: string }> = {
  en: { 
    short: 'MM/dd/yyyy', 
    long: 'MMMM d, yyyy' 
  },
  bn: { 
    short: 'dd/MM/yyyy', 
    long: 'd MMMM, yyyy' 
  }
};