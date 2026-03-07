import { PipelineStats } from '@/types/strategy';

export const mockPipelineStats: PipelineStats = {
  today: {
    generated: 38,
    backtestPassed: 7,
    wfPassed: 2,
    paperTrading: 1,
  },
  total: {
    generated: 14280,
    backtestPassed: 2142,
    wfPassed: 428,
    paperTrading: 23,
    deployed: 6,
  },
  paperTradingStrategies: [
    { name: 'Order Flow Imbalance', daysActive: 18, currentReturn: 12.4, status: 'active' },
    { name: 'Multi-TF Trend Follower', daysActive: 24, currentReturn: 8.7, status: 'active' },
    { name: 'Mean Reversion RSI Div', daysActive: 30, currentReturn: 22.1, status: 'promoted' },
    { name: 'Liquidation Cascade', daysActive: 12, currentReturn: -3.2, status: 'active' },
    { name: 'OI Spike Reversal', daysActive: 7, currentReturn: 5.1, status: 'active' },
  ],
  systemStatus: {
    lastResearchRun: '2026-03-07T14:30:00Z',
    dataCollectionHealth: 'healthy',
    dbSize: '24.3 GB',
    coinsTracked: 50,
  },
};
