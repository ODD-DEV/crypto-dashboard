'use client';

import type { CoinStats } from '@/types/backtest';

interface Props {
  coins: Record<string, CoinStats>;
}

function fmt(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function CoinBreakdown({ coins }: Props) {
  const sorted = Object.entries(coins).sort((a, b) => b[1].pnl - a[1].pnl);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
        Per-Coin Performance
      </h3>
      <div className="space-y-0">
        {sorted.map(([coin, stats]) => (
          <div
            key={coin}
            className="flex w-full items-center justify-between border-b border-border/50 py-3 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-jetbrains)] text-sm font-medium text-text-primary">
                {coin.replace('USDT', '')}
              </span>
              <span className="text-xs text-text-muted">{stats.trades} trades</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-muted">WR {stats.win_rate}%</span>
              <span
                className={`font-[family-name:var(--font-jetbrains)] text-sm font-semibold ${
                  stats.pnl > 0 ? 'text-accent-profit' : 'text-accent-loss'
                }`}
              >
                {fmt(stats.pnl)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
