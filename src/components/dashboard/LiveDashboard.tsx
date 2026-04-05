'use client';

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ---------- Types ----------

interface OpenPosition {
  id: string;
  strategy: string;
  coin: string;
  side: string;
  entry_time: string;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  margin: number;
  leverage: number;
  updated_at: string;
}

interface LiveTrade {
  id: string;
  strategy: string;
  coin: string;
  side: string;
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  margin: number;
  leverage: number;
  pnl: number;
  pnl_pct: number;
  exit_type: string;
  created_at: string;
}

interface EquitySnapshot {
  id: string;
  equity: number;
  drawdown_pct: number;
  snapshot_time: string;
}

// ---------- Helpers ----------

function fmtPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toPrecision(4);
}

function fmtPnl(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fmtDollar(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

const exitColors: Record<string, string> = {
  TP: 'text-accent-profit',
  SL: 'text-accent-loss',
  TO: 'text-text-muted',
  FC: 'text-accent-highlight',
  TRAIL: 'text-accent-profit',
};

const strategyColors: Record<string, string> = {
  VWAP: '#818cf8',
  CONSOL: '#f472b6',
  DIPBUY: '#34d399',
};

// ---------- Component ----------

export function LiveDashboard() {
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [equitySnapshots, setEquitySnapshots] = useState<EquitySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowser();

  const fetchData = useCallback(async () => {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const todayStr = todayUtc.toISOString();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [posRes, tradeRes, eqRes] = await Promise.all([
      supabase.from('open_positions').select('*'),
      supabase
        .from('live_trades')
        .select('*')
        .gte('created_at', todayStr)
        .order('created_at', { ascending: false }),
      supabase
        .from('equity_snapshots')
        .select('*')
        .gte('snapshot_time', last24h)
        .order('snapshot_time', { ascending: true }),
    ]);

    if (posRes.data) setPositions(posRes.data);
    if (tradeRes.data) setTrades(tradeRes.data);
    if (eqRes.data) setEquitySnapshots(eqRes.data);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('live-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'open_positions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions((prev) => [...prev, payload.new as OpenPosition]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions((prev) =>
              prev.map((p) =>
                p.id === (payload.new as OpenPosition).id ? (payload.new as OpenPosition) : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPositions((prev) =>
              prev.filter((p) => p.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_trades' },
        (payload) => {
          setTrades((prev) => [payload.new as LiveTrade, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'equity_snapshots' },
        (payload) => {
          setEquitySnapshots((prev) => [...prev, payload.new as EquitySnapshot]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived
  const latestEquity = equitySnapshots.length > 0
    ? equitySnapshots[equitySnapshots.length - 1]
    : null;
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealized_pnl, 0);
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);
  const todayPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const todayWins = trades.filter((t) => t.pnl > 0).length;
  const equityChartData = equitySnapshots.map((s) => ({
    time: fmtTime(s.snapshot_time),
    equity: s.equity,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-text-muted">Loading live data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
          <div className="text-[10px] text-text-muted sm:text-xs">Account Equity</div>
          <div className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold text-text-primary sm:mt-1 sm:text-lg">
            {latestEquity ? `$${latestEquity.equity.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '--'}
          </div>
          {latestEquity && latestEquity.drawdown_pct > 0 && (
            <div className="text-[10px] text-accent-loss sm:text-xs">
              DD: -{latestEquity.drawdown_pct.toFixed(2)}%
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
          <div className="text-[10px] text-text-muted sm:text-xs">Open Positions</div>
          <div className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold text-text-primary sm:mt-1 sm:text-lg">
            {positions.length}
          </div>
          <div className="text-[10px] text-text-muted sm:text-xs">
            ${totalMargin.toLocaleString('en-US', { maximumFractionDigits: 0 })} margin
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
          <div className="text-[10px] text-text-muted sm:text-xs">Unrealized PnL</div>
          <div className={`mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold sm:mt-1 sm:text-lg ${totalUnrealizedPnl >= 0 ? 'text-accent-profit' : 'text-accent-loss'}`}>
            {fmtPnl(totalUnrealizedPnl)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
          <div className="text-[10px] text-text-muted sm:text-xs">Today&apos;s PnL</div>
          <div className={`mt-0.5 font-[family-name:var(--font-jetbrains)] text-base font-bold sm:mt-1 sm:text-lg ${todayPnl >= 0 ? 'text-accent-profit' : 'text-accent-loss'}`}>
            {fmtPnl(todayPnl)}
          </div>
          <div className="text-[10px] text-text-muted sm:text-xs">
            {trades.length} trades ({todayWins}W/{trades.length - todayWins}L)
          </div>
        </div>
      </div>

      {/* Open Positions + Equity Chart */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Open Positions */}
        <div className="space-y-3 lg:col-span-2">
          <h3 className="font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-text-primary sm:text-sm">
            Open Positions
          </h3>
          {positions.length === 0 ? (
            <div className="rounded-xl border border-border bg-bg-card p-6 text-center text-xs text-text-muted sm:p-8 sm:text-sm">
              No open positions
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              {positions.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-[family-name:var(--font-jetbrains)] text-xs font-bold text-text-primary sm:text-sm">
                        {p.coin.replace('USDT', '')}
                      </span>
                      <span
                        className="rounded px-1 py-0.5 text-[9px] font-semibold uppercase sm:px-1.5 sm:text-[10px]"
                        style={{
                          backgroundColor: (strategyColors[p.strategy] || '#64748b') + '20',
                          color: strategyColors[p.strategy] || '#64748b',
                        }}
                      >
                        {p.strategy}
                      </span>
                    </div>
                    <span
                      className={`rounded px-1 py-0.5 text-[9px] font-bold uppercase sm:px-1.5 sm:text-[10px] ${
                        p.side === 'long'
                          ? 'bg-accent-profit/10 text-accent-profit'
                          : 'bg-accent-loss/10 text-accent-loss'
                      }`}
                    >
                      {p.side} {p.leverage}x
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-[10px] sm:mt-3 sm:gap-y-2 sm:text-xs">
                    <div>
                      <div className="text-text-muted">Entry</div>
                      <div className="font-[family-name:var(--font-jetbrains)] text-text-secondary">
                        ${fmtPrice(p.entry_price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-muted">Current</div>
                      <div className="font-[family-name:var(--font-jetbrains)] text-text-secondary">
                        ${fmtPrice(p.current_price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-muted">Margin</div>
                      <div className="font-[family-name:var(--font-jetbrains)] text-text-secondary">
                        ${p.margin.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-muted">PnL</div>
                      <div
                        className={`font-[family-name:var(--font-jetbrains)] font-semibold ${
                          p.unrealized_pnl >= 0 ? 'text-accent-profit' : 'text-accent-loss'
                        }`}
                      >
                        {fmtPnl(p.unrealized_pnl)} <span className="font-normal">({fmtPct(p.unrealized_pnl_pct)})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Equity Chart */}
        <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-6">
          <h3 className="mb-3 font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-text-primary sm:mb-4 sm:text-sm">
            Equity (24h)
          </h3>
          {equityChartData.length === 0 ? (
            <div className="flex h-[160px] items-center justify-center text-xs text-text-muted sm:h-[200px] sm:text-sm">
              No snapshots yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={equityChartData}>
                <defs>
                  <linearGradient id="liveEquityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={fmtDollar}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f2e',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    color: '#e2e8f0',
                    fontSize: 11,
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
                    'Equity',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#liveEquityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Today's Trades — card layout on mobile, table on desktop */}
      <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-6">
        <h3 className="mb-3 font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-text-primary sm:mb-4 sm:text-sm">
          Today&apos;s Trades ({trades.length})
        </h3>
        {trades.length === 0 ? (
          <div className="py-6 text-center text-xs text-text-muted sm:py-8 sm:text-sm">
            No trades today
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="space-y-2 sm:hidden">
              {trades.map((t) => (
                <div key={t.id} className="rounded-lg border border-border/50 bg-bg-secondary/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-[family-name:var(--font-jetbrains)] text-xs font-bold text-text-primary">
                        {t.coin.replace('USDT', '')}
                      </span>
                      <span className="text-[10px] text-text-muted">{t.strategy}</span>
                      <span className={`text-[10px] ${t.side === 'long' ? 'text-accent-profit' : 'text-accent-loss'}`}>
                        {t.side}
                      </span>
                    </div>
                    <span className={`font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold ${exitColors[t.exit_type] || 'text-text-muted'}`}>
                      {t.exit_type}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="text-[10px] text-text-muted">
                      {fmtTime(t.exit_time || t.created_at)} · ${t.margin}×{t.leverage}
                    </div>
                    <div className={`font-[family-name:var(--font-jetbrains)] text-xs font-semibold ${t.pnl >= 0 ? 'text-accent-profit' : 'text-accent-loss'}`}>
                      {fmtPnl(t.pnl)} <span className="font-normal text-[10px]">({fmtPct(t.pnl_pct)})</span>
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
                    <th className="py-2 text-left">Time</th>
                    <th className="py-2 text-left">Strategy</th>
                    <th className="py-2 text-left">Coin</th>
                    <th className="py-2 text-left">Side</th>
                    <th className="py-2 text-right">Entry</th>
                    <th className="py-2 text-right">Exit</th>
                    <th className="py-2 text-left">Type</th>
                    <th className="py-2 text-right">Margin</th>
                    <th className="py-2 text-right">PnL</th>
                    <th className="py-2 text-right">PnL%</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-border/30 hover:bg-bg-secondary/30">
                      <td className="py-1.5 font-[family-name:var(--font-jetbrains)] text-text-secondary">
                        {fmtTime(t.exit_time || t.created_at)}
                      </td>
                      <td className="py-1.5 text-text-muted">{t.strategy}</td>
                      <td className="py-1.5 font-medium text-text-primary">{t.coin.replace('USDT', '')}</td>
                      <td className={`py-1.5 ${t.side === 'long' ? 'text-accent-profit' : 'text-accent-loss'}`}>
                        {t.side}
                      </td>
                      <td className="py-1.5 text-right font-[family-name:var(--font-jetbrains)] text-text-secondary">
                        ${fmtPrice(t.entry_price)}
                      </td>
                      <td className="py-1.5 text-right font-[family-name:var(--font-jetbrains)] text-text-secondary">
                        ${fmtPrice(t.exit_price)}
                      </td>
                      <td className={`py-1.5 font-[family-name:var(--font-jetbrains)] ${exitColors[t.exit_type] || 'text-text-muted'}`}>
                        {t.exit_type}
                      </td>
                      <td className="py-1.5 text-right font-[family-name:var(--font-jetbrains)] text-text-secondary">
                        ${t.margin.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`py-1.5 text-right font-[family-name:var(--font-jetbrains)] font-semibold ${t.pnl >= 0 ? 'text-accent-profit' : 'text-accent-loss'}`}>
                        {fmtPnl(t.pnl)}
                      </td>
                      <td className={`py-1.5 text-right font-[family-name:var(--font-jetbrains)] ${t.pnl >= 0 ? 'text-accent-profit' : 'text-accent-loss'}`}>
                        {fmtPct(t.pnl_pct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
