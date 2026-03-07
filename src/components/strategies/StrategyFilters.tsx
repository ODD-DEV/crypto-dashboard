'use client';

import { useTranslations } from 'next-intl';

const filters = ['all', 'testing', 'live', 'degraded'] as const;

interface StrategyFiltersProps {
  active: string;
  onFilter: (filter: string) => void;
}

export function StrategyFilters({ active, onFilter }: StrategyFiltersProps) {
  const t = useTranslations('strategies.filter');

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilter(filter)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            active === filter
              ? 'bg-accent-profit/20 text-accent-profit'
              : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
          }`}
        >
          {t(filter)}
        </button>
      ))}
    </div>
  );
}
