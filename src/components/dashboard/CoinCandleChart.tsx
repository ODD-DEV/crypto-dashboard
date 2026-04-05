'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import type { UTCTimestamp } from 'lightweight-charts';
import type { Trade, Timeframe } from '@/types/backtest';

interface Props {
  coins: string[];
  trades: Trade[];
}

const TIMEFRAMES: Timeframe[] = ['5m', '15m', '1h', '4h', '1d'];

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function CoinCandleChart({ coins, trades }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [selectedCoin, setSelectedCoin] = useState(coins[0] || '');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load candle data for selected coin
  useEffect(() => {
    if (!selectedCoin) return;
    setLoading(true);
    fetch(`/candles/${selectedCoin}/${timeframe}.json`)
      .then((r) => {
        if (!r.ok) throw new Error('No data');
        return r.json();
      })
      .then((data: Candle[]) => {
        setCandles(data);
        setLoading(false);
      })
      .catch(() => {
        setCandles([]);
        setLoading(false);
      });
  }, [selectedCoin, timeframe]);

  // Map trades to markers
  const markers = useMemo(() => {
    if (!candles.length) return [];
    const coinTrades = trades.filter((t) => t.coin === selectedCoin);
    const result: Array<{
      time: UTCTimestamp;
      position: 'belowBar' | 'aboveBar';
      color: string;
      shape: 'arrowUp' | 'arrowDown';
      text: string;
    }> = [];

    for (const t of coinTrades) {
      // Entry marker: strategy, margin, leverage
      if (t.entry_time && t.entry_time !== '?') {
        result.push({
          time: (new Date(t.entry_time).getTime() / 1000) as UTCTimestamp,
          position: 'belowBar',
          color: t.side === 'long' ? '#00d4ff' : '#ff3366',
          shape: 'arrowUp',
          text: `${t.strategy} ${t.side} $${t.margin}×${t.leverage}`,
        });
      }
      // Exit marker: type, PnL ($), PnL (%)
      const pnlSign = t.pnl > 0 ? '+' : '';
      result.push({
        time: (new Date(t.exit_time).getTime() / 1000) as UTCTimestamp,
        position: 'aboveBar',
        color: t.pnl > 0 ? '#34d399' : '#ff3366',
        shape: 'arrowDown',
        text: `${t.exit_type} ${pnlSign}$${Math.round(t.pnl)} (${pnlSign}${t.pnl_pct}%)`,
      });
    }

    return result.sort((a, b) => (a.time as number) - (b.time as number));
  }, [trades, selectedCoin, candles]);

  // Render chart
  useEffect(() => {
    if (!containerRef.current || !candles.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#1a1f2e' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: containerRef.current.clientWidth,
      height: window.innerWidth < 640 ? 300 : 450,
      timeScale: { borderColor: '#1e293b' },
      rightPriceScale: { borderColor: '#1e293b' },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00d4ff',
      downColor: '#ff3366',
      borderUpColor: '#00d4ff',
      borderDownColor: '#ff3366',
      wickUpColor: '#00d4ff',
      wickDownColor: '#ff3366',
    });

    const chartData = candles.map((c) => ({
      time: (new Date(c.time).getTime() / 1000) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    series.setData(chartData);

    if (markers.length > 0) {
      createSeriesMarkers(series, markers);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, markers]);

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Trade count per coin
  const coinTradeCount = useCallback(
    (coin: string) => trades.filter((t) => t.coin === coin).length,
    [trades]
  );

  const coinPnl = useCallback(
    (coin: string) => trades.filter((t) => t.coin === coin).reduce((s, t) => s + t.pnl, 0),
    [trades]
  );

  return (
    <div className="rounded-xl border border-border bg-bg-card p-3 sm:p-6">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        {/* Coin dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-secondary px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-card-hover sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <span className="font-[family-name:var(--font-jetbrains)]">
              {selectedCoin.replace('USDT', '')}/USDT
            </span>
            <svg
              className={`h-4 w-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-64 overflow-y-auto rounded-xl border border-border bg-bg-card shadow-lg">
              {coins.map((coin) => {
                const pnl = coinPnl(coin);
                const count = coinTradeCount(coin);
                return (
                  <button
                    key={coin}
                    onClick={() => {
                      setSelectedCoin(coin);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-bg-secondary ${
                      selectedCoin === coin ? 'bg-bg-secondary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedCoin === coin && (
                        <div className="h-1.5 w-1.5 rounded-full bg-accent-profit" />
                      )}
                      <span className="font-[family-name:var(--font-jetbrains)] font-medium text-text-primary">
                        {coin.replace('USDT', '')}
                      </span>
                      <span className="text-xs text-text-muted">{count} trades</span>
                    </div>
                    <span
                      className={`font-[family-name:var(--font-jetbrains)] text-xs font-semibold ${
                        pnl > 0 ? 'text-accent-profit' : 'text-accent-loss'
                      }`}
                    >
                      {pnl > 0 ? '+' : ''}${Math.round(pnl).toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeframe buttons */}
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors sm:px-3 sm:text-xs ${
                timeframe === tf
                  ? 'bg-accent-profit/20 text-accent-profit'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[300px] items-center justify-center text-xs text-text-muted sm:h-[450px]">Loading...</div>
      ) : candles.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-xs text-text-muted sm:h-[450px]">
          No candle data for {selectedCoin} ({timeframe})
        </div>
      ) : (
        <div ref={containerRef} className="w-full overflow-hidden rounded-lg" />
      )}
    </div>
  );
}
