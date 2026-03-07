'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Strategy } from '@/types/strategy';
import { StrategyFilters } from '@/components/strategies/StrategyFilters';
import { StrategyCard } from '@/components/strategies/StrategyCard';
import { AdSlot } from '@/components/ui/AdSlot';

interface StrategyListClientProps {
  strategies: Strategy[];
}

export function StrategyListClient({ strategies }: StrategyListClientProps) {
  const t = useTranslations('strategies');
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all'
      ? strategies
      : strategies.filter((s) => s.status === filter);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-[family-name:var(--font-jetbrains)] text-3xl font-bold">
        {t('title')}
      </h1>

      <div className="mt-6">
        <StrategyFilters active={filter} onFilter={setFilter} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((strategy, i) => (
          <motion.div
            key={strategy.slug}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <StrategyCard strategy={strategy} />
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <AdSlot slot="strategies-bottom" />
      </div>
    </section>
  );
}
