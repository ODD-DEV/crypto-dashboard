import backtestRaw from '@/data/backtest-data.json';
import type { BacktestData, Trade, StrategyFilter } from '@/types/backtest';

const data = backtestRaw as BacktestData;

export function getBacktestData(): BacktestData {
  return data;
}

export function getTradesByStrategy(strategy: StrategyFilter): Trade[] {
  if (strategy === 'ALL') return data.trades;
  return data.trades.filter((t) => t.strategy === strategy);
}

export function getTradesByCoin(coin: string, strategy?: StrategyFilter): Trade[] {
  let trades = data.trades.filter((t) => t.coin === coin);
  if (strategy && strategy !== 'ALL') {
    trades = trades.filter((t) => t.strategy === strategy);
  }
  return trades;
}

export function getCoinsForStrategy(strategy: StrategyFilter): string[] {
  const trades = getTradesByStrategy(strategy);
  const coins = [...new Set(trades.map((t) => t.coin))];
  return coins.sort((a, b) => {
    const pnlA = trades.filter((t) => t.coin === a).reduce((s, t) => s + t.pnl, 0);
    const pnlB = trades.filter((t) => t.coin === b).reduce((s, t) => s + t.pnl, 0);
    return pnlB - pnlA;
  });
}

export function getEquityCurveForStrategy(strategy: StrategyFilter) {
  if (strategy === 'ALL') {
    return data.equity_curve.map((p) => ({ date: p.date, value: p.equity }));
  }
  // Build equity curve from trades for a specific strategy
  const trades = getTradesByStrategy(strategy).sort(
    (a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
  );
  let equity = 0;
  const curve: { date: string; value: number }[] = [{ date: data.period.start, value: 0 }];
  for (const t of trades) {
    equity += t.pnl;
    curve.push({ date: t.exit_time.slice(0, 10), value: Math.round(equity * 100) / 100 });
  }
  return curve;
}

export function getMonthlyPnlForStrategy(strategy: StrategyFilter) {
  return data.monthly_pnl.map((m) => {
    const value =
      strategy === 'ALL'
        ? m.total
        : strategy === 'VWAP'
          ? m.vwap
          : strategy === 'CONSOL'
            ? m.consol
            : m.dipbuy;
    return { month: m.month, return: Math.round((value / Math.max(m.start_eq, 1)) * 1000) / 10 };
  });
}

export function getStrategySlugMap(): Record<string, { name: string; description: string }> {
  return {
    portfolio: {
      name: 'Portfolio Combined',
      description: 'VWAP + Consolidation Short + DipBuy — All strategies combined',
    },
    vwap: {
      name: 'VWAP Long',
      description: 'Session VWAP + swing low anchor, funding filter, drop filter. 5x leverage.',
    },
    consol: {
      name: 'Consolidation Short',
      description: 'BTC consolidation detection → short volatile alts. 5x leverage.',
    },
    dipbuy: {
      name: 'DipBuy',
      description: 'Sharp drop detection → long entry. HBAR/ADA/BTC, 10x leverage.',
    },
  };
}
