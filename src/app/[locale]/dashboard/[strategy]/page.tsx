import { notFound } from 'next/navigation';
import { StrategyNav } from '@/components/dashboard/StrategyNav';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import backtestData from '@/data/backtest-data.json';
import type { BacktestData, StrategyFilter } from '@/types/backtest';

export const dynamic = 'force-dynamic';

const slugToFilter: Record<string, StrategyFilter> = {
  portfolio: 'ALL',
  vwap: 'VWAP',
  consol: 'CONSOL',
  dipbuy: 'DIPBUY',
  'rsi-mr': 'RSI_MR',
};

const slugToName: Record<string, string> = {
  portfolio: 'Portfolio Combined',
  vwap: 'VWAP Long',
  consol: 'Consolidation Short',
  dipbuy: 'DipBuy',
  'rsi-mr': 'RSI Mean Reversion',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; strategy: string }>;
}) {
  const { strategy } = await params;
  const name = slugToName[strategy];
  if (!name) return { title: 'Not Found' };
  return {
    title: `${name} — Backtest Dashboard`,
    description: `Live backtest results for ${name} strategy`,
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string; strategy: string }>;
}) {
  const { strategy } = await params;
  const filter = slugToFilter[strategy];
  if (!filter) notFound();

  const data = backtestData as BacktestData;

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-2">
        <h1 className="font-[family-name:var(--font-jetbrains)] text-lg font-bold sm:text-2xl">
          {slugToName[strategy]}
        </h1>
        <p className="mt-0.5 text-xs text-text-muted sm:mt-1 sm:text-sm">
          {data.period.start} — {data.period.end} · ${data.initial_capital.toLocaleString()} initial
        </p>
      </div>
      <StrategyNav />
      <DashboardClient data={data} strategyFilter={filter} />
    </section>
  );
}
