import { getTranslations } from 'next-intl/server';
import { Sidebar } from '@/components/home/Sidebar';

export async function generateMetadata() {
  return {
    title: 'About | Crypto Research Notes',
    description: 'What this blog is about and how the AI strategy research pipeline works.',
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">{t('title')}</h1>

      <div className="prose prose-sm prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary">
        <p>
          I built an AI system that generates crypto trading strategies, then I torture-test each one
          with walk-forward validation to see if it actually works out of sample. This blog documents
          what I find — the winners, the losers, and the ones that looked great until they didn&apos;t.
        </p>

        <h2>How it works</h2>
        <p>
          Every 3 hours, an AI researcher (Claude Sonnet) scans academic papers, open-source libraries,
          and web resources for trading strategy ideas. It generates about 40 strategies per day.
        </p>
        <p>
          Each strategy goes through a pipeline:
        </p>
        <ol>
          <li><strong>Backtest</strong> — Run against historical data with realistic execution assumptions (fees, slippage, limit orders)</li>
          <li><strong>Walk-forward validation</strong> — Test on out-of-sample data to check if the edge is real</li>
          <li><strong>Paper trading</strong> — Run in real-time with fake money to verify live behavior</li>
          <li><strong>Live</strong> — Only if everything checks out</li>
        </ol>
        <p>
          Most strategies die at step 1. A few survive to step 2. Very few make it to step 3.
          I write about the interesting ones here — whether they worked or not.
        </p>

        <h2>Why this blog exists</h2>
        <p>
          Because I got tired of &quot;this strategy makes 500% returns!&quot; posts that never show
          walk-forward results. If a strategy only works on the data it was trained on, it&apos;s not
          a strategy — it&apos;s a curve fit. I wanted to show what rigorous testing actually looks like.
        </p>
      </div>

      <div className="mt-12">
        <Sidebar statusLabel={t('systemStatus')} statsLabel={t('stats')} />
      </div>
    </section>
  );
}
