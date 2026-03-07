export interface Strategy {
  slug: string;
  name: string;
  concept: { en: string; ko: string };
  status: 'testing' | 'live' | 'degraded' | 'failed';
  coins: string[];
  metrics: {
    totalReturn: number;
    monthlyAvgReturn: number;
    maxDrawdown: number;
    winRate: number;
    sharpeRatio: number;
    tradeWeekPct: number;
    totalTrades: number;
  };
  walkForward: {
    passed: boolean;
    quarters: { period: string; return: number }[];
  };
  equityCurve: { date: string; value: number }[];
  monthlyReturns: { month: string; return: number }[];
  trades: {
    date: string;
    type: 'buy' | 'sell';
    price: number;
    coin: string;
  }[];
  candles: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  discoveredAt: string;
  source: 'papers' | 'library' | 'web_search';
}

export interface PipelineStats {
  today: {
    generated: number;
    backtestPassed: number;
    wfPassed: number;
    paperTrading: number;
  };
  total: {
    generated: number;
    backtestPassed: number;
    wfPassed: number;
    paperTrading: number;
    deployed: number;
  };
  paperTradingStrategies: {
    name: string;
    daysActive: number;
    currentReturn: number;
    status: 'active' | 'degraded' | 'promoted';
  }[];
  systemStatus: {
    lastResearchRun: string;
    dataCollectionHealth: 'healthy' | 'warning' | 'error';
    dbSize: string;
    coinsTracked: number;
  };
}
