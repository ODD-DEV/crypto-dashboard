import { StrategyNav } from '@/components/dashboard/StrategyNav';
import { LiveDashboard } from '@/components/dashboard/LiveDashboard';

export const metadata = {
  title: 'Live Trading — Dashboard',
  description: 'Real-time open positions, trades, and account equity',
};

export default function LivePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-2">
        <h1 className="font-[family-name:var(--font-jetbrains)] text-lg font-bold sm:text-2xl">
          Live Trading
        </h1>
        <p className="mt-0.5 text-xs text-text-muted sm:mt-1 sm:text-sm">
          Real-time positions, trades &amp; equity
        </p>
      </div>
      <StrategyNav />
      <LiveDashboard />
    </section>
  );
}
