'use client';

import { Strategy } from '@/types/strategy';

interface MetricsTableProps {
  metrics: Strategy['metrics'];
}

const rows: {
  label: string;
  key: keyof Strategy['metrics'];
  format: (v: number) => string;
  color: 'profit' | 'loss' | 'neutral';
}[] = [
  { label: 'Total Return', key: 'totalReturn', format: (v) => `${v}%`, color: 'profit' },
  { label: 'Monthly Avg', key: 'monthlyAvgReturn', format: (v) => `${v}%`, color: 'profit' },
  { label: 'Max Drawdown', key: 'maxDrawdown', format: (v) => `${v}%`, color: 'loss' },
  { label: 'Win Rate', key: 'winRate', format: (v) => `${v}%`, color: 'neutral' },
  { label: 'Sharpe Ratio', key: 'sharpeRatio', format: (v) => `${v}`, color: 'neutral' },
  { label: 'Trade Weeks', key: 'tradeWeekPct', format: (v) => `${v}%`, color: 'neutral' },
  { label: 'Total Trades', key: 'totalTrades', format: (v) => `${v}`, color: 'neutral' },
];

const colorMap = {
  profit: 'text-accent-profit',
  loss: 'text-accent-loss',
  neutral: 'text-text-primary',
};

export function MetricsTable({ metrics }: MetricsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
        Key Metrics
      </h3>
      <ul className="space-y-0">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
          >
            <span className="text-sm text-text-secondary">{row.label}</span>
            <span
              className={`font-[family-name:var(--font-jetbrains)] text-sm font-semibold ${colorMap[row.color]}`}
            >
              {row.format(metrics[row.key])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
