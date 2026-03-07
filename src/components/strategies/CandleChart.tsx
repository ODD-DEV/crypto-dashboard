'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import type { UTCTimestamp } from 'lightweight-charts';

interface CandleChartProps {
  candles: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  trades: {
    date: string;
    type: 'buy' | 'sell';
    price: number;
    coin: string;
  }[];
}

export function CandleChart({ candles, trades }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const coins = useMemo(() => [...new Set(trades.map((t) => t.coin))], [trades]);

  const [selectedCoin, setSelectedCoin] = useState(() => coins[0] || '');

  const filteredTrades = useMemo(
    () => trades.filter((t) => t.coin === selectedCoin),
    [trades, selectedCoin]
  );

  useEffect(() => {
    if (!containerRef.current) return;

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
      height: 400,
      timeScale: {
        borderColor: '#1e293b',
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00d4ff',
      downColor: '#ff3366',
      borderUpColor: '#00d4ff',
      borderDownColor: '#ff3366',
      wickUpColor: '#00d4ff',
      wickDownColor: '#ff3366',
    });

    const candleData = candles.map((c) => ({
      time: (new Date(c.time).getTime() / 1000) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeries.setData(candleData);

    const markers = filteredTrades.map((t) => ({
      time: (new Date(t.date).getTime() / 1000) as UTCTimestamp,
      position: t.type === 'buy' ? ('belowBar' as const) : ('aboveBar' as const),
      color: t.type === 'buy' ? '#00d4ff' : '#ff3366',
      shape: t.type === 'buy' ? ('arrowUp' as const) : ('arrowDown' as const),
      text: `${t.type.toUpperCase()} ${t.coin}`,
    }));

    markers.sort((a, b) => (a.time as number) - (b.time as number));
    createSeriesMarkers(candleSeries, markers);

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
  }, [candles, filteredTrades]);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
          Price & Trades
        </h3>
        <div className="flex gap-1">
          {coins.map((coin) => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedCoin === coin
                  ? 'bg-accent-profit/20 text-accent-profit'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              {coin}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="w-full overflow-hidden rounded-lg" />
    </div>
  );
}
