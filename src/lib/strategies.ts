import { supabase } from './supabase';
import { Strategy } from '@/types/strategy';

interface StrategyRow {
  slug: string;
  name: string;
  concept_en: string;
  concept_ko: string;
  status: Strategy['status'];
  coins: string[];
  backtest_period: Strategy['backtestPeriod'];
  metrics: Strategy['metrics'];
  walk_forward: Strategy['walkForward'];
  equity_curve: Strategy['equityCurve'];
  monthly_returns: Strategy['monthlyReturns'];
  trades: Strategy['trades'];
  candles: Strategy['candles'];
  discovered_at: string;
  source: Strategy['source'];
}

function rowToStrategy(row: StrategyRow): Strategy {
  return {
    slug: row.slug,
    name: row.name,
    concept: { en: row.concept_en, ko: row.concept_ko },
    status: row.status,
    coins: row.coins,
    backtestPeriod: row.backtest_period,
    metrics: row.metrics,
    walkForward: row.walk_forward,
    equityCurve: row.equity_curve,
    monthlyReturns: row.monthly_returns,
    trades: row.trades,
    candles: row.candles,
    discoveredAt: row.discovered_at,
    source: row.source,
  };
}

export async function getAllStrategies(): Promise<Strategy[]> {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .order('discovered_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToStrategy);
}

export async function getStrategy(slug: string): Promise<Strategy | null> {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return rowToStrategy(data);
}
