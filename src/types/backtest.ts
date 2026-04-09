export interface BacktestData {
  generated_at: string;
  initial_capital: number;
  period: { start: string; end: string };
  summary: {
    total_pnl: number;
    total_return_pct: number;
    total_trades: number;
    win_rate: number;
    max_drawdown_pct: number;
    final_equity: number;
    total_withdrawn: number;
  };
  strategies: Record<string, StrategyStats>;
  equity_curve: EquityPoint[];
  monthly_pnl: MonthlyPnl[];
  trades: Trade[];
  per_coin: Record<string, CoinStats>;
}

export interface StrategyStats {
  trades: number;
  pnl: number;
  win_rate: number;
  avg_pnl: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  drawdown_pct: number;
}

export interface MonthlyPnl {
  month: string;
  vwap: number;
  consol: number;
  dipbuy: number;
  fvg: number;
  rsi_mr: number;
  total: number;
  start_eq: number;
  end_eq: number;
  return_pct: number;
}

export interface Trade {
  id: number;
  entry_time: string;
  exit_time: string;
  coin: string;
  strategy: string;
  side: 'long' | 'short';
  exit_type: string;
  entry_price: number;
  exit_price: number;
  margin: number;
  leverage: number;
  pnl: number;
  pnl_pct: number;
  bars: number;
}

export interface CoinStats {
  trades: number;
  pnl: number;
  win_rate: number;
}

export type StrategyFilter = 'ALL' | 'VWAP' | 'CONSOL' | 'DIPBUY' | 'RSI_MR';
export type Timeframe = '5m' | '15m' | '1h' | '4h' | '1d';
