import { notFound } from 'next/navigation';
import { mockStrategies } from '@/data/mock-strategies';
import { DetailHeader } from '@/components/strategies/DetailHeader';
import { EquityCurveChart } from '@/components/strategies/EquityCurveChart';
import { CandleChart } from '@/components/strategies/CandleChart';
import { MonthlyReturnsHeatmap } from '@/components/strategies/MonthlyReturnsHeatmap';
import { MetricsTable } from '@/components/strategies/MetricsTable';
import { WalkForwardChart } from '@/components/strategies/WalkForwardChart';
import { AdSlot } from '@/components/ui/AdSlot';
import { ArticleJsonLd } from '@/components/seo/JsonLd';

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
  const { locale, slug } = await params;
  const strategy = mockStrategies.find((s) => s.slug === slug);

  if (!strategy) {
    notFound();
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aicryptolab.vercel.app';

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ArticleJsonLd
        title={strategy.name}
        description={strategy.concept[locale as 'en' | 'ko']}
        date={strategy.discoveredAt}
        url={`${BASE_URL}/${locale}/strategies/${slug}`}
      />

      <DetailHeader strategy={strategy} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EquityCurveChart data={strategy.equityCurve} />
          <CandleChart candles={strategy.candles} trades={strategy.trades} />
          <MonthlyReturnsHeatmap data={strategy.monthlyReturns} />
        </div>
        <div className="space-y-6">
          <MetricsTable metrics={strategy.metrics} backtestPeriod={strategy.backtestPeriod} />
          <WalkForwardChart quarters={strategy.walkForward.quarters} />
        </div>
      </div>

      <AdSlot slot="strategy-detail-mid" className="mt-8 h-24" />

      <div className="mt-8">
        <AdSlot slot="strategy-detail-bottom" className="h-24" />
      </div>
    </section>
  );
}
