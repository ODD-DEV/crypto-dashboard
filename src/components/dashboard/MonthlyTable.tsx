'use client';

import type { MonthlyPnl, StrategyFilter } from '@/types/backtest';

interface Props {
  data: MonthlyPnl[];
  filter: StrategyFilter;
}

function fmt(n: number): string {
  if (n === 0) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function MonthlyTable({ data, filter }: Props) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-6">
      <h3 className="mb-3 font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-text-primary sm:mb-4 sm:text-sm">
        Monthly Performance
      </h3>

      {/* Mobile: card layout */}
      <div className="space-y-1.5 sm:hidden">
        {data.map((m) => {
          const total = filter === 'ALL' ? m.total
            : filter === 'VWAP' ? m.vwap
            : filter === 'CONSOL' ? m.consol
            : filter === 'DIPBUY' ? m.dipbuy
            : m.rsi_mr;
          return (
            <div key={m.month} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
              <div>
                <div className="font-[family-name:var(--font-jetbrains)] text-[11px] font-medium text-text-secondary">
                  {m.month}
                </div>
                <div className="mt-0.5 text-[9px] text-text-muted">
                  Eq: ${m.end_eq.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold ${total > 0 ? 'text-accent-profit' : total < 0 ? 'text-accent-loss' : 'text-text-muted'}`}>
                  {fmt(total)}
                </div>
                <div className={`font-[family-name:var(--font-jetbrains)] text-[9px] ${m.return_pct > 0 ? 'text-accent-profit' : m.return_pct < 0 ? 'text-accent-loss' : 'text-text-muted'}`}>
                  {m.return_pct > 0 ? '+' : ''}{m.return_pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="py-2 text-left font-medium">Month</th>
              {filter === 'ALL' && (
                <>
                  <th className="py-2 text-right font-medium">VWAP</th>
                  <th className="py-2 text-right font-medium">CONSOL</th>
                  <th className="py-2 text-right font-medium">DIPBUY</th>
                  <th className="py-2 text-right font-medium">RSI MR</th>
                </>
              )}
              <th className="py-2 text-right font-medium">Total</th>
              <th className="py-2 text-right font-medium">Equity</th>
              <th className="py-2 text-right font-medium">Return</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => {
              const total = filter === 'ALL' ? m.total
                : filter === 'VWAP' ? m.vwap
                : filter === 'CONSOL' ? m.consol
                : filter === 'DIPBUY' ? m.dipbuy
                : m.rsi_mr;
              const pctColor = total > 0 ? 'text-accent-profit' : total < 0 ? 'text-accent-loss' : 'text-text-muted';

              return (
                <tr key={m.month} className="border-b border-border/50 hover:bg-bg-secondary/30">
                  <td className="py-2 font-[family-name:var(--font-jetbrains)] text-text-secondary">
                    {m.month}
                  </td>
                  {filter === 'ALL' && (
                    <>
                      <td className={`py-2 text-right font-[family-name:var(--font-jetbrains)] ${m.vwap > 0 ? 'text-accent-profit' : m.vwap < 0 ? 'text-accent-loss' : 'text-text-muted'}`}>
                        {fmt(m.vwap)}
                      </td>
                      <td className={`py-2 text-right font-[family-name:var(--font-jetbrains)] ${m.consol > 0 ? 'text-accent-profit' : m.consol < 0 ? 'text-accent-loss' : 'text-text-muted'}`}>
                        {fmt(m.consol)}
                      </td>
                      <td className={`py-2 text-right font-[family-name:var(--font-jetbrains)] ${m.dipbuy > 0 ? 'text-accent-profit' : m.dipbuy < 0 ? 'text-accent-loss' : 'text-text-muted'}`}>
                        {fmt(m.dipbuy)}
                      </td>
                      <td className={`py-2 text-right font-[family-name:var(--font-jetbrains)] ${m.rsi_mr > 0 ? 'text-accent-profit' : m.rsi_mr < 0 ? 'text-accent-loss' : 'text-text-muted'}`}>
                        {fmt(m.rsi_mr)}
                      </td>
                    </>
                  )}
                  <td className={`py-2 text-right font-[family-name:var(--font-jetbrains)] font-semibold ${pctColor}`}>
                    {fmt(total)}
                  </td>
                  <td className="py-2 text-right font-[family-name:var(--font-jetbrains)] text-text-secondary">
                    ${m.end_eq.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`py-2 text-right font-[family-name:var(--font-jetbrains)] ${pctColor}`}>
                    {m.return_pct > 0 ? '+' : ''}{m.return_pct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
