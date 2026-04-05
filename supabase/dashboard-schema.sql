-- Crypto Dashboard Schema (separate Supabase project)
-- Run this in the Supabase SQL Editor

-- ══════════════════════════════════════════════
-- 1. Backtest results (JSON blob per strategy run)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS backtest_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,  -- 'portfolio', 'vwap', 'consol', 'dipbuy'
  data JSONB NOT NULL,         -- full backtest-data.json content
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════
-- 2. Live trades (pushed by EC2 bots)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS live_trades (
  id BIGSERIAL PRIMARY KEY,
  strategy TEXT NOT NULL,       -- 'VWAP', 'CONSOL', 'DIPBUY'
  coin TEXT NOT NULL,           -- 'BTCUSDT'
  side TEXT NOT NULL,           -- 'long', 'short'
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  entry_price NUMERIC,
  exit_price NUMERIC,
  margin NUMERIC,
  leverage INTEGER,
  pnl NUMERIC,
  pnl_pct NUMERIC,
  exit_type TEXT,               -- 'TP', 'SL', 'TO'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════
-- 3. Equity snapshots (hourly from EC2)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS equity_snapshots (
  id BIGSERIAL PRIMARY KEY,
  equity NUMERIC NOT NULL,
  drawdown_pct NUMERIC DEFAULT 0,
  snapshot_time TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════
-- 4. RLS — only authenticated users can read
-- ══════════════════════════════════════════════
ALTER TABLE backtest_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_snapshots ENABLE ROW LEVEL SECURITY;

-- Read policy: authenticated users only
CREATE POLICY "auth_read_backtest" ON backtest_runs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_read_trades" ON live_trades
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_read_equity" ON equity_snapshots
  FOR SELECT TO authenticated USING (true);

-- Write policy: service role only (EC2 push)
-- Service role bypasses RLS by default, so no policy needed

-- ══════════════════════════════════════════════
-- 5. Indexes
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_live_trades_strategy ON live_trades(strategy);
CREATE INDEX IF NOT EXISTS idx_live_trades_coin ON live_trades(coin);
CREATE INDEX IF NOT EXISTS idx_live_trades_exit_time ON live_trades(exit_time DESC);
CREATE INDEX IF NOT EXISTS idx_equity_snapshots_time ON equity_snapshots(snapshot_time DESC);
