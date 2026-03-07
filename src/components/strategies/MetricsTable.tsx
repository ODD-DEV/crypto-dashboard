'use client';

import { Strategy } from '@/types/strategy';

interface MetricsTableProps {
  metrics: Strategy['metrics'];
  backtestPeriod: Strategy['backtestPeriod'];
}

function calcAnnualizedReturn(totalReturn: number, startDate: string, endDate: string): number {
  const days = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 0) return 0;
  const years = days / 365;
  const annualized = (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100;
  return Math.round(annualized * 10) / 10;
}

const colorMap = {
  profit: 'text-accent-profit',
  loss: 'text-accent-loss',
  neutral: 'text-text-primary',
  muted: 'text-text-secondary',
};

export function MetricsTable({ metrics, backtestPeriod }: MetricsTableProps) {
  const annualizedReturn = calcAnnualizedReturn(
    metrics.totalReturn,
    backtestPeriod.start,
    backtestPeriod.end
  );

  const rows: {
    label: string;
    value: string;
    color: keyof typeof colorMap;
  }[] = [
    {
      label: 'Backtest Period',
      value: `${backtestPeriod.start} ~ ${backtestPeriod.end}`,
      color: 'muted',
    },
    {
      label: 'Cumulative Return',
      value: `+${metrics.totalReturn}%`,
      color: 'profit',
    },
    {
      label: 'Annualized Return',
      value: `+${annualizedReturn}%`,
      color: 'profit',
    },
    {
      label: 'Monthly Avg',
      value: `+${metrics.monthlyAvgReturn}%`,
      color: 'profit',
    },
    {
      label: 'Max Drawdown',
      value: `-${metrics.maxDrawdown}%`,
      color: 'loss',
    },
    { label: 'Win Rate', value: `${metrics.winRate}%`, color: 'neutral' },
    { label: 'Sharpe Ratio', value: `${metrics.sharpeRatio}`, color: 'neutral' },
    { label: 'Trade Weeks', value: `${metrics.tradeWeekPct}%`, color: 'neutral' },
    { label: 'Total Trades', value: `${metrics.totalTrades}`, color: 'neutral' },
  ];

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
        Key Metrics
      </h3>
      <ul className="space-y-0">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
          >
            <span className="text-sm text-text-secondary">{row.label}</span>
            <span
              className={`font-[family-name:var(--font-jetbrains)] text-sm font-semibold ${colorMap[row.color]}`}
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
