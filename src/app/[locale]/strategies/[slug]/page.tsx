import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mockStrategies } from '@/data/mock-strategies';
import { getStrategyContent } from '@/lib/strategy-content';
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
  const content = getStrategyContent(slug, locale);

  if (!strategy) return { title: 'Strategy Not Found' };

  return {
    title: `${strategy.name} — ${strategy.metrics.totalReturn}% Return | AI Crypto Strategy Lab`,
    description: content?.description || strategy.concept[locale as 'en' | 'ko'],
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

  const strategyContent = getStrategyContent(slug, locale);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aicryptolab.vercel.app';

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ArticleJsonLd
        title={strategyContent?.title || strategy.name}
        description={strategyContent?.description || strategy.concept[locale as 'en' | 'ko']}
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

      {strategyContent && (
        <>
          <AdSlot slot="strategy-detail-mid" className="mt-8 h-24" />
          <div className="mt-8 rounded-xl border border-border bg-bg-card p-8">
            <div className="prose prose-sm prose-invert max-w-none prose-headings:font-[family-name:var(--font-jetbrains)] prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary prose-code:text-accent-profit prose-h2:text-xl prose-h3:text-lg prose-h2:mt-8 prose-h3:mt-6">
              <MDXRemote source={strategyContent.content} />
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <AdSlot slot="strategy-detail-bottom" className="h-24" />
      </div>
    </section>
  );
}
