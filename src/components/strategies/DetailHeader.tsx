'use client';

import { useLocale } from 'next-intl';
import { Strategy } from '@/types/strategy';

const statusColors: Record<string, string> = {
  live: 'bg-accent-profit/20 text-accent-profit',
  testing: 'bg-accent-highlight/20 text-accent-highlight',
  degraded: 'bg-accent-loss/20 text-accent-loss',
  failed: 'bg-text-muted/20 text-text-muted',
};

interface DetailHeaderProps {
  strategy: Strategy;
}

export function DetailHeader({ strategy }: DetailHeaderProps) {
  const locale = useLocale();

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-[family-name:var(--font-jetbrains)] text-2xl font-bold sm:text-3xl">
          {strategy.name}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[strategy.status]}`}
        >
          {strategy.status}
        </span>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
        {strategy.concept[locale as 'en' | 'ko']}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {strategy.coins.map((coin) => (
          <span
            key={coin}
            className="rounded bg-bg-card px-2 py-1 text-xs font-medium text-text-muted"
          >
            {coin}
          </span>
        ))}
      </div>
    </div>
  );
}
