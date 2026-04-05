'use client';

import type { BacktestData } from '@/types/backtest';

interface PortfolioSummaryProps {
  data: BacktestData;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function PortfolioSummary({ data }: PortfolioSummaryProps) {
  const s = data.summary;
  const months = data.monthly_pnl.length;
  const monthlyAvg = s.total_pnl / months;

  const cards = [
    { label: 'Total PnL', value: `$${fmt(s.total_pnl)}`, sub: `+${s.total_return_pct}%`, color: 'text-accent-profit' },
    { label: 'Monthly Avg', value: `$${fmt(monthlyAvg)}`, sub: `${months} months`, color: 'text-accent-profit' },
    { label: 'Win Rate', value: `${s.win_rate}%`, sub: `${s.total_trades} trades`, color: 'text-text-primary' },
    { label: 'Max DD', value: `-${s.max_drawdown_pct}%`, sub: '', color: 'text-accent-loss' },
    { label: 'Final Equity', value: `$${fmt(s.final_equity)}`, sub: `from $${fmt(data.initial_capital)}`, color: 'text-accent-profit' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
          <div className="text-[10px] text-text-muted sm:text-xs">{c.label}</div>
          <div className={`mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold sm:mt-1 sm:text-lg ${c.color}`}>
            {c.value}
          </div>
          {c.sub && <div className="text-[10px] text-text-muted sm:text-xs">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}
