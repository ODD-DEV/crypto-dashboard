'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CountUp } from '@/components/ui/CountUp';

const metrics = [
  { key: 'tested', end: 14280, suffix: '+', decimals: 0 },
  { key: 'passRate', end: 3.0, suffix: '%', decimals: 1 },
  { key: 'paperTrading', end: 23, suffix: '', decimals: 0 },
  { key: 'avgReturn', end: 18.7, suffix: '%', decimals: 1 },
] as const;

export function MetricCards() {
  const t = useTranslations('hero.metrics');

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map(({ key, end, suffix, decimals }, i) => (
          <motion.div
            key={key}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glow-profit rounded-xl border border-border bg-bg-card p-6"
          >
            <div className="text-3xl font-bold text-accent-profit sm:text-4xl">
              <CountUp end={end} suffix={suffix} decimals={decimals} />
            </div>
            <p className="mt-2 text-sm text-text-secondary">{t(key)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
