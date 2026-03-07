'use client';

import { PipelineStats } from '@/types/strategy';
import { useTranslations } from 'next-intl';

interface PaperTradingTableProps {
  strategies: PipelineStats['paperTradingStrategies'];
}

const statusStyles: Record<string, string> = {
  active: 'bg-accent-profit/20 text-accent-profit',
  degraded: 'bg-accent-loss/20 text-accent-loss',
  promoted: 'bg-accent-highlight/20 text-accent-highlight',
};

export function PaperTradingTable({ strategies }: PaperTradingTableProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">
        {t('paperTrading')}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="pb-2 pr-4">Strategy</th>
              <th className="pb-2 pr-4 text-right">Days</th>
              <th className="pb-2 pr-4 text-right">Return</th>
              <th className="pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((s) => (
              <tr
                key={s.name}
                className="border-b border-border/50 last:border-0"
              >
                <td className="py-2.5 pr-4 font-[family-name:var(--font-jetbrains)] text-text-primary">
                  {s.name}
                </td>
                <td className="py-2.5 pr-4 text-right font-[family-name:var(--font-jetbrains)] text-text-secondary">
                  {s.daysActive}
                </td>
                <td
                  className={`py-2.5 pr-4 text-right font-[family-name:var(--font-jetbrains)] ${
                    s.currentReturn >= 0
                      ? 'text-accent-profit'
                      : 'text-accent-loss'
                  }`}
                >
                  {s.currentReturn >= 0 ? '+' : ''}
                  {s.currentReturn.toFixed(1)}%
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[s.status]}`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
