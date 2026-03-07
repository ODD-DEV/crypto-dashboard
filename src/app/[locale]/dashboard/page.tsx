'use client';

import { useTranslations } from 'next-intl';
import { mockPipelineStats } from '@/data/mock-dashboard';
import { CountUp } from '@/components/ui/CountUp';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { PaperTradingTable } from '@/components/dashboard/PaperTradingTable';
import { SystemStatus } from '@/components/dashboard/SystemStatus';

const todayCards = [
  { key: 'generated', color: 'text-text-secondary' },
  { key: 'backtestPassed', color: 'text-accent-muted' },
  { key: 'wfPassed', color: 'text-accent-highlight' },
  { key: 'paperTrading', color: 'text-accent-profit' },
] as const;

const cardLabels: Record<string, string> = {
  generated: 'Generated',
  backtestPassed: 'Backtest Passed',
  wfPassed: 'WF Validated',
  paperTrading: 'Paper Trading',
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const stats = mockPipelineStats;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">
        {t('title')}
      </h1>

      {/* Today stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {todayCards.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-border bg-bg-card p-5"
          >
            <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">
              {cardLabels[card.key]}
            </p>
            <p className={`text-2xl font-bold ${card.color}`}>
              <CountUp end={stats.today[card.key]} />
            </p>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FunnelChart stats={stats} />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <SystemStatus status={stats.systemStatus} />
          <PaperTradingTable strategies={stats.paperTradingStrategies} />
        </div>
      </div>
    </section>
  );
}
