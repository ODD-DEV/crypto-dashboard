'use client';

import { useState } from 'react';
import type { Trade } from '@/types/backtest';

interface Props {
  trades: Trade[];
}

const exitColors: Record<string, string> = {
  TP: 'text-accent-profit',
  SL: 'text-accent-loss',
  TO: 'text-text-muted',
  FC: 'text-accent-highlight',
};

function fmt(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function TradeList({ trades }: Props) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...trades].sort(
    (a, b) => new Date(b.exit_time).getTime() - new Date(a.exit_time).getTime()
  );
  const visible = showAll ? sorted : sorted.slice(0, 20);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h3 className="font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-text-primary sm:text-sm">
          Trade Log ({trades.length})
        </h3>
        {trades.length > 20 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] text-accent-profit hover:underline sm:text-xs"
          >
            {showAll ? 'Show less' : `Show all ${trades.length}`}
          </button>
        )}
      </div>

      {/* Mobile: card layout */}
      <div className="space-y-1.5 sm:hidden">
        {visible.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-[family-name:var(--font-jetbrains)] text-[11px] font-bold text-text-primary">
                  {t.coin.replace('USDT', '')}
                </span>
                <span className="text-[9px] text-text-muted">{t.strategy}</span>
                <span className={`text-[9px] ${t.side === 'long' ? 'text-accent-profit' : 'text-accent-loss'}`}>
                  {t.side}
                </span>
                <span className={`font-[family-name:var(--font-jetbrains)] text-[9px] ${exitColors[t.exit_type] || 'text-text-muted'}`}>
                  {t.exit_type}
                </span>
              </div>
              <div className="mt-0.5 text-[9px] text-text-muted">
                {t.exit_time.slice(0, 10)} · ${t.margin}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold ${t.pnl > 0 ? 'text-accent-profit' : 'text-accent-loss'}`}>
                {fmt(t.pnl)}
              </div>
              <div className={`font-[family-name:var(--font-jetbrains)] text-[9px] ${t.pnl > 0 ? 'text-accent-profit' : 'text-accent-loss'}`}>
                {t.pnl_pct > 0 ? '+' : ''}{t.pnl_pct}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="py-2 text-left">Exit</th>
              <th className="py-2 text-left">Coin</th>
              <th className="py-2 text-left">Strategy</th>
              <th className="py-2 text-left">Side</th>
              <th className="py-2 text-left">Type</th>
              <th className="py-2 text-right">Margin</th>
              <th className="py-2 text-right">PnL</th>
              <th className="py-2 text-right">PnL%</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className="border-b border-border/30 hover:bg-bg-secondary/30">
                <td className="py-1.5 font-[family-name:var(--font-jetbrains)] text-text-secondary">
                  {t.exit_time.slice(0, 10)}
                </td>
                <td className="py-1.5 font-medium text-text-primary">{t.coin.replace('USDT', '')}</td>
                <td className="py-1.5 text-text-muted">{t.strategy}</td>
                <td className={`py-1.5 ${t.side === 'long' ? 'text-accent-profit' : 'text-accent-loss'}`}>
                  {t.side}
                </td>
                <td className={`py-1.5 font-[family-name:var(--font-jetbrains)] ${exitColors[t.exit_type] || 'text-text-muted'}`}>
                  {t.exit_type}
                </td>
                <td className="py-1.5 text-right font-[family-name:var(--font-jetbrains)] text-text-secondary">
                  ${t.margin.toLocaleString()}
                </td>
                <td className={`py-1.5 text-right font-[family-name:var(--font-jetbrains)] font-semibold ${
                  t.pnl > 0 ? 'text-accent-profit' : 'text-accent-loss'
                }`}>
                  {fmt(t.pnl)}
                </td>
                <td className={`py-1.5 text-right font-[family-name:var(--font-jetbrains)] ${
                  t.pnl > 0 ? 'text-accent-profit' : 'text-accent-loss'
                }`}>
                  {t.pnl_pct > 0 ? '+' : ''}{t.pnl_pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
