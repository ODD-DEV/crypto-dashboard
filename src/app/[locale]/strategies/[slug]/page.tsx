import { notFound } from 'next/navigation';
import { mockStrategies } from '@/data/mock-strategies';
import { DetailHeader } from '@/components/strategies/DetailHeader';
import { EquityCurveChart } from '@/components/strategies/EquityCurveChart';
import { CandleChart } from '@/components/strategies/CandleChart';
import { MonthlyReturnsHeatmap } from '@/components/strategies/MonthlyReturnsHeatmap';
import { MetricsTable } from '@/components/strategies/MetricsTable';
import { WalkForwardChart } from '@/components/strategies/WalkForwardChart';
import { AdSlot } from '@/components/ui/AdSlot';

export function generateStaticParams() {
  return mockStrategies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const strategy = mockStrategies.find((s) => s.slug === slug);
  if (!strategy) return { title: 'Strategy Not Found' };

  return {
    title: `${strategy.name} — ${strategy.metrics.totalReturn}% Return | AI Crypto Strategy Lab`,
    description: strategy.concept[locale as 'en' | 'ko'],
  };
}

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const strategy = mockStrategies.find((s) => s.slug === slug);

  if (!strategy) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <DetailHeader strategy={strategy} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EquityCurveChart data={strategy.equityCurve} />
          <CandleChart candles={strategy.candles} trades={strategy.trades} />
          <MonthlyReturnsHeatmap data={strategy.monthlyReturns} />
        </div>
        <div className="space-y-6">
          <MetricsTable metrics={strategy.metrics} />
          <WalkForwardChart quarters={strategy.walkForward.quarters} />
        </div>
      </div>

      <div className="mt-12">
        <AdSlot slot="strategy-detail-bottom" />
      </div>
    </section>
  );
}
