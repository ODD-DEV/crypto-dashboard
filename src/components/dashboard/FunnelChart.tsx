'use client';

import { motion } from 'framer-motion';
import { PipelineStats } from '@/types/strategy';
import { useTranslations, useLocale } from 'next-intl';

interface FunnelChartProps {
  stats: PipelineStats;
}

const stages = [
  { key: 'generated', color: '#94a3b8' },
  { key: 'backtestPassed', color: '#2563eb' },
  { key: 'wfPassed', color: '#ffd700' },
  { key: 'paperTrading', color: '#00d4ff' },
] as const;

const labels: Record<string, { en: string; ko: string }> = {
  generated: { en: 'Generated', ko: '생성됨' },
  backtestPassed: { en: 'Backtest Passed', ko: '백테스트 통과' },
  wfPassed: { en: 'WF Validated', ko: 'WF 검증 통과' },
  paperTrading: { en: 'Paper Trading', ko: '페이퍼 트레이딩' },
};

export function FunnelChart({ stats }: FunnelChartProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale() as 'en' | 'ko';
  const max = stats.total.generated;

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-6 text-lg font-semibold text-text-primary">
        {t('funnel')}
      </h3>
      <div className="space-y-4">
        {stages.map((stage, i) => {
          const value = stats.total[stage.key];
          const pct = max > 0 ? (value / max) * 100 : 0;

          return (
            <div key={stage.key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  {labels[stage.key][locale]}
                </span>
                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-text-primary">
                  {value.toLocaleString()}
                </span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-md bg-bg-primary">
                <motion.div
                  className="h-full rounded-md"
                  style={{ backgroundColor: stage.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(pct, 1)}%` }}
                  transition={{
                    duration: 1,
                    delay: i * 0.15,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
