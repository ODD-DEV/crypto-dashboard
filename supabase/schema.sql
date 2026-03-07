-- Crypto Research Notes — Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- Strategies table (backtest data)
CREATE TABLE strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'testing' CHECK (status IN ('testing', 'live', 'degraded', 'failed')),
  coins TEXT[] NOT NULL DEFAULT '{}',
  backtest_period JSONB NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}',
  walk_forward JSONB NOT NULL DEFAULT '{}',
  equity_curve JSONB NOT NULL DEFAULT '[]',
  monthly_returns JSONB NOT NULL DEFAULT '[]',
  trades JSONB NOT NULL DEFAULT '[]',
  candles JSONB NOT NULL DEFAULT '[]',
  concept_en TEXT,
  concept_ko TEXT,
  source TEXT CHECK (source IN ('papers', 'library', 'web_search')),
  discovered_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  strategy_slug TEXT REFERENCES strategies(slug),
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  description_en TEXT NOT NULL,
  content_ko TEXT NOT NULL,
  content_en TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Strategy Test',
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read strategies" ON strategies FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);

-- Service role write access (for EC2 pipeline)
CREATE POLICY "Service write strategies" ON strategies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write posts" ON posts FOR ALL USING (true) WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER strategies_updated_at BEFORE UPDATE ON strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
