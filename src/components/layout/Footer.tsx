import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-text-muted">
          {t('disclaimer')}
        </p>
        <p className="mt-4 text-center text-xs text-text-muted">
          &copy; {year} Crypto Research Notes. {t('rights')}
        </p>
      </div>
    </footer>
  );
}
