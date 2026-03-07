'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Strategy } from '@/types/strategy';
import { MiniEquityCurve } from './MiniEquityCurve';

const statusColors: Record<string, string> = {
  live: 'bg-accent-profit/20 text-accent-profit',
  testing: 'bg-accent-highlight/20 text-accent-highlight',
  degraded: 'bg-accent-loss/20 text-accent-loss',
  failed: 'bg-text-muted/20 text-text-muted',
};

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const t = useTranslations('strategies.metrics');
  const locale = useLocale();

  return (
    <Link
      href={`/strategies/${strategy.slug}`}
      className="group block rounded-xl border border-border bg-bg-card p-6 transition-colors hover:border-border-light hover:bg-bg-card-hover"
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

      <div className="mt-3">
        <MiniEquityCurve data={strategy.equityCurve} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
        {strategy.concept[locale as 'en' | 'ko']}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {strategy.coins.map((coin) => (
          <span
            key={coin}
            className="rounded bg-bg-primary px-1.5 py-0.5 text-xs text-text-muted"
          >
            {coin}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
        <div>
          <div className="text-text-muted">{t('return')}</div>
          <div className="font-medium text-accent-profit">
            {strategy.metrics.totalReturn}%
          </div>
        </div>
        <div>
          <div className="text-text-muted">{t('mdd')}</div>
          <div className="font-medium text-accent-loss">
            {strategy.metrics.maxDrawdown}%
          </div>
        </div>
        <div>
          <div className="text-text-muted">{t('winRate')}</div>
          <div className="font-medium text-text-primary">
            {strategy.metrics.winRate}%
          </div>
        </div>
        <div>
          <div className="text-text-muted">{t('sharpe')}</div>
          <div className="font-medium text-text-primary">
            {strategy.metrics.sharpeRatio}
          </div>
        </div>
      </div>
    </Link>
  );
}
