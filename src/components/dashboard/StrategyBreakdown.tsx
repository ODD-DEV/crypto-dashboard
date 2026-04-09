'use client';

import type { BacktestData } from '@/types/backtest';

interface Props {
  data: BacktestData;
}

const stratColors: Record<string, string> = {
  VWAP: '#818cf8',
  CONSOL: '#f472b6',
  DIPBUY: '#34d399',
  RSI_MR: '#fb923c',
};

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function StrategyBreakdown({ data }: Props) {
  const strats = Object.entries(data.strategies);
  const totalPnl = strats.reduce((s, [, v]) => s + v.pnl, 0);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
        Strategy Breakdown
      </h3>

      {/* Bar chart */}
      <div className="mb-4 flex h-6 overflow-hidden rounded-full">
        {strats.map(([name, s]) => {
          const pct = (s.pnl / totalPnl) * 100;
          return (
            <div
              key={name}
              style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: stratColors[name] || '#64748b' }}
              className="transition-all"
              title={`${name}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Table */}
      <div className="space-y-0">
        {strats.map(([name, s]) => (
          <div key={name} className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stratColors[name] || '#64748b' }} />
              <span className="text-sm text-text-primary">{name}</span>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <div className="font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-accent-profit">
                  ${fmt(s.pnl)}
                </div>
                <div className="text-xs text-text-muted">{((s.pnl / totalPnl) * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-jetbrains)] text-sm text-text-primary">
                  {s.win_rate}%
                </div>
                <div className="text-xs text-text-muted">{s.trades} trades</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-jetbrains)] text-sm text-text-secondary">
                  ${fmt(s.avg_pnl)}
                </div>
                <div className="text-xs text-text-muted">avg</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
