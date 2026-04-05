'use client';

import { useState, useMemo } from 'react';
import type { BacktestData, StrategyFilter } from '@/types/backtest';
import { PortfolioSummary } from './PortfolioSummary';
import { StrategyBreakdown } from './StrategyBreakdown';
import { MonthlyTable } from './MonthlyTable';
import { CoinBreakdown } from './CoinBreakdown';
import { CoinCandleChart } from './CoinCandleChart';
import { TradeList } from './TradeList';
import { EquityCurveChart } from '@/components/strategies/EquityCurveChart';
import { MonthlyReturnsHeatmap } from '@/components/strategies/MonthlyReturnsHeatmap';

interface Props {
  data: BacktestData;
  strategyFilter: StrategyFilter;
}

export function DashboardClient({ data, strategyFilter }: Props) {
  const isPortfolio = strategyFilter === 'ALL';

  // Build filtered data
  const filteredTrades = useMemo(() => {
    if (strategyFilter === 'ALL') return data.trades;
    return data.trades.filter((t) => t.strategy === strategyFilter);
  }, [data.trades, strategyFilter]);

  const filteredCoins = useMemo(() => {
    const coinMap: Record<string, { trades: number; pnl: number; wins: number }> = {};
    for (const t of filteredTrades) {
      if (!coinMap[t.coin]) coinMap[t.coin] = { trades: 0, pnl: 0, wins: 0 };
      coinMap[t.coin].trades++;
      coinMap[t.coin].pnl += t.pnl;
      if (t.pnl > 0) coinMap[t.coin].wins++;
    }
    const result: Record<string, { trades: number; pnl: number; win_rate: number }> = {};
    for (const [coin, s] of Object.entries(coinMap)) {
      result[coin] = { trades: s.trades, pnl: Math.round(s.pnl * 100) / 100, win_rate: Math.round((s.wins / s.trades) * 1000) / 10 };
    }
    return result;
  }, [filteredTrades]);

  // Equity curve — always show absolute equity ($)
  const equityCurve = useMemo(() => {
    if (strategyFilter === 'ALL') {
      return data.equity_curve.map((p) => ({ date: p.date, value: p.equity }));
    }
    // For single strategy: show cumulative PnL added to initial capital share
    const trades = [...filteredTrades].sort(
      (a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
    );
    let cumPnl = 0;
    const curve: { date: string; value: number }[] = [];
    for (const t of trades) {
      cumPnl += t.pnl;
      curve.push({ date: t.exit_time.slice(0, 10), value: Math.round(cumPnl * 100) / 100 });
    }
    return curve;
  }, [data, filteredTrades, strategyFilter]);

  // Monthly returns for heatmap
  const monthlyReturns = useMemo(() => {
    return data.monthly_pnl.map((m) => {
      const value =
        strategyFilter === 'ALL' ? m.total
        : strategyFilter === 'VWAP' ? m.vwap
        : strategyFilter === 'CONSOL' ? m.consol
        : m.dipbuy;
      const pct = m.start_eq > 0 ? Math.round((value / m.start_eq) * 1000) / 10 : 0;
      return { month: m.month, return: pct };
    });
  }, [data.monthly_pnl, strategyFilter]);

  // Sorted coins for candle chart dropdown
  const sortedCoinNames = useMemo(
    () => Object.entries(filteredCoins).sort((a, b) => b[1].pnl - a[1].pnl).map(([c]) => c),
    [filteredCoins]
  );

  // Strategy-specific summary
  const stratSummary = useMemo(() => {
    if (strategyFilter === 'ALL') return null;
    const s = data.strategies[strategyFilter];
    if (!s) return null;
    return s;
  }, [data.strategies, strategyFilter]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary cards */}
      {isPortfolio ? (
        <PortfolioSummary data={data} />
      ) : stratSummary ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
            <div className="text-[10px] text-text-muted sm:text-xs">Total PnL</div>
            <div className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold sm:mt-1 sm:text-lg text-accent-profit">
              ${stratSummary.pnl.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
            <div className="text-[10px] text-text-muted sm:text-xs">Win Rate</div>
            <div className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold sm:mt-1 sm:text-lg text-text-primary">
              {stratSummary.win_rate}%
            </div>
            <div className="text-xs text-text-muted">{stratSummary.trades} trades</div>
          </div>
          <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
            <div className="text-[10px] text-text-muted sm:text-xs">Avg PnL</div>
            <div className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold sm:mt-1 sm:text-lg text-accent-profit">
              ${stratSummary.avg_pnl.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
            <div className="text-[10px] text-text-muted sm:text-xs">Coins</div>
            <div className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold sm:mt-1 sm:text-lg text-text-primary">
              {Object.keys(filteredCoins).length}
            </div>
          </div>
        </div>
      ) : null}

      {/* Equity curve + Strategy breakdown (portfolio) or Monthly heatmap */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EquityCurveChart data={equityCurve} />
          <MonthlyReturnsHeatmap data={monthlyReturns} />
        </div>
        <div className="space-y-6">
          {isPortfolio && <StrategyBreakdown data={data} />}
          <CoinBreakdown
            coins={filteredCoins}
          />
        </div>
      </div>

      {/* Candle chart with coin dropdown */}
      {sortedCoinNames.length > 0 && (
        <CoinCandleChart coins={sortedCoinNames} trades={filteredTrades} />
      )}

      {/* Monthly table */}
      <MonthlyTable data={data.monthly_pnl} filter={strategyFilter} />

      {/* Trade log */}
      <TradeList trades={filteredTrades} />
    </div>
  );
}
