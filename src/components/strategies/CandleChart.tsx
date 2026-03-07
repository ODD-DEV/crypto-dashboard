'use client';

import { useEffect, useRef } from 'react';
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

    const markers = trades.map((t) => ({
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
  }, [candles, trades]);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
        Price & Trades
      </h3>
      <div ref={containerRef} className="w-full overflow-hidden rounded-lg" />
    </div>
  );
}
