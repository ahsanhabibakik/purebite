'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { locales, localeNames, localeLabels, type Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown' | 'minimal';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'dropdown', 
  showLabel = true, 
  className = '' 
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // Remove the current locale from the pathname
      const segments = pathname.split('/');
      if (locales.includes(segments[1] as Locale)) {
        segments.splice(1, 1);
      }
      
      // Create new path with new locale
      const newPath = newLocale === 'bn' 
        ? segments.join('/') || '/'
        : `/${newLocale}${segments.join('/') || ''}`;
      
      router.push(newPath);
      setIsOpen(false);
    });
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              loc === locale
                ? 'bg-green-100 text-green-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            disabled={isPending}
          >
            {localeLabels[loc]}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    const otherLocale = locales.find(loc => loc !== locale) as Locale;
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleLocaleChange(otherLocale)}
        disabled={isPending}
        className={`flex items-center gap-2 ${className}`}
      >
        <Globe className="w-4 h-4" />
        {showLabel && (
          <span className="hidden sm:inline">
            {localeNames[otherLocale]}
          </span>
        )}
        <span className="sm:hidden">
          {localeLabels[otherLocale]}
        </span>
      </Button>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        {showLabel && (
          <span className="hidden sm:inline">
            {localeNames[locale]}
          </span>
        )}
        <span className="sm:hidden">
          {localeLabels[locale]}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  disabled={isPending}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                    loc === locale
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-medium">
                      {localeLabels[loc]}
                    </span>
                    <span>{localeNames[loc]}</span>
                  </div>
                  {loc === locale && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook for getting the current language info
export function useCurrentLanguage() {
  const locale = useLocale() as Locale;
  
  return {
    locale,
    name: localeNames[locale],
    label: localeLabels[locale],
    isRTL: false, // We can add RTL support later
    direction: 'ltr' as const
  };
}