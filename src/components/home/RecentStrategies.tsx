'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { mockStrategies } from '@/data/mock-strategies';

const statusColors: Record<string, string> = {
  live: 'bg-accent-profit/20 text-accent-profit',
  testing: 'bg-accent-highlight/20 text-accent-highlight',
  degraded: 'bg-accent-loss/20 text-accent-loss',
  failed: 'bg-text-muted/20 text-text-muted',
};

export function RecentStrategies() {
  const t = useTranslations('strategies');
  const locale = useLocale();
  const strategies = mockStrategies.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="font-[family-name:var(--font-jetbrains)] text-2xl font-bold">
        {t('title')}
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {strategies.map((strategy, i) => (
          <motion.div
            key={strategy.slug}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <Link
              href={`/strategies/${strategy.slug}`}
              className="block rounded-xl border border-border bg-bg-card p-6 transition-colors hover:bg-bg-card-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
                  {strategy.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[strategy.status]}`}
                >
                  {strategy.status}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
                {strategy.concept[locale as 'en' | 'ko']}
              </p>

              <div className="mt-4 flex gap-4 text-xs text-text-muted">
                <span>
                  {t('metrics.return')}{' '}
                  <span className="text-accent-profit">
                    {strategy.metrics.totalReturn}%
                  </span>
                </span>
                <span>
                  {t('metrics.mdd')}{' '}
                  <span className="text-accent-loss">
                    {strategy.metrics.maxDrawdown}%
                  </span>
                </span>
                <span>
                  {t('metrics.winRate')}{' '}
                  <span className="text-text-primary">
                    {strategy.metrics.winRate}%
                  </span>
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
