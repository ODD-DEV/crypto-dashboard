'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

const locales = ['en', 'ko'] as const;

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border px-1 py-1">
      {locales.map((locale) => {
        const isActive = currentLocale === locale;
        return (
          <button
            key={locale}
            onClick={() => switchLocale(locale)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors ${
              isActive
                ? 'bg-accent-profit/20 text-accent-profit'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
