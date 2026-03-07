import { mockStrategies } from '@/data/mock-strategies';
import { StrategyListClient } from '@/components/strategies/StrategyListClient';

export const metadata = {
  title: 'Strategies | AI Crypto Strategy Lab',
  description:
    'Browse AI-generated crypto trading strategies with backtest results, walk-forward validation, and live performance metrics.',
};

export default function StrategiesPage() {
  return <StrategyListClient strategies={mockStrategies} />;
}
