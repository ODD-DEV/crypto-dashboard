import { Strategy } from '@/types/strategy';

// Seeded pseudo-random number generator for deterministic data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateEquityCurve(
  totalReturn: number,
  months: number,
  seed: number
): { date: string; value: number }[] {
  const rng = seededRandom(seed);
  const totalDays = months * 30;
  // Target final value based on totalReturn (e.g., 247.3 -> 347.3)
  const targetFinal = 100 + totalReturn;
  // Daily compound rate to hit the target
  const dailyRate = Math.pow(targetFinal / 100, 1 / totalDays) - 1;

  const points: { date: string; value: number }[] = [];
  let value = 100;
  const startDate = new Date('2025-06-01');

  for (let day = 0; day < totalDays; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const noise = (rng() - 0.5) * 0.02;
    value *= 1 + dailyRate + noise;
    if (value < 10) value = 10;
    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    });
  }

  // Scale to match exact totalReturn at the end
  const actualFinal = points[points.length - 1].value;
  const scale = targetFinal / actualFinal;
  for (const p of points) {
    p.value = Math.round(((p.value - 100) * scale + 100) * 100) / 100;
  }

  return points;
}

function generateCandles(
  seed: number
): { time: string; open: number; high: number; low: number; close: number }[] {
  const rng = seededRandom(seed);
  const candles: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[] = [];
  let price = 85000 + rng() * 20000;
  const startDate = new Date('2026-02-05');

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const open = price;
    const change = (rng() - 0.48) * 0.03 * price;
    const close = open + change;
    const high = Math.max(open, close) + rng() * 0.015 * price;
    const low = Math.min(open, close) - rng() * 0.015 * price;
    candles.push({
      time: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
    price = close;
  }
  return candles;
}

function generateTrades(
  candles: { time: string; open: number; close: number }[],
  coins: string[],
  seed: number
): { date: string; type: 'buy' | 'sell'; price: number; coin: string }[] {
  const rng = seededRandom(seed);
  const trades: {
    date: string;
    type: 'buy' | 'sell';
    price: number;
    coin: string;
  }[] = [];

  for (let i = 2; i < candles.length - 1; i += 3) {
    if (rng() > 0.4) {
      const coin = coins[Math.floor(rng() * coins.length)];
      const buyPrice = candles[i].close * (0.98 + rng() * 0.04);
      trades.push({
        date: candles[i].time,
        type: 'buy',
        price: Math.round(buyPrice * 100) / 100,
        coin,
      });
      if (i + 1 < candles.length) {
        const sellPrice = buyPrice * (0.97 + rng() * 0.08);
        trades.push({
          date: candles[i + 1].time,
          type: 'sell',
          price: Math.round(sellPrice * 100) / 100,
          coin,
        });
      }
    }
  }
  return trades;
}

function generateMonthlyReturns(
  avgReturn: number,
  seed: number
): { month: string; return: number }[] {
  const rng = seededRandom(seed);
  const months = [
    '2025-07',
    '2025-08',
    '2025-09',
    '2025-10',
    '2025-11',
    '2025-12',
    '2026-01',
    '2026-02',
    '2026-03',
  ];
  return months.map((month) => ({
    month,
    return:
      Math.round(
        (avgReturn + (rng() - 0.5) * avgReturn * 0.8) * 10
      ) / 10,
  }));
}

function generateWalkForward(
  seed: number
): { passed: boolean; quarters: { period: string; return: number }[] } {
  const rng = seededRandom(seed);
  const quarters = [
    { period: 'Q3 2025', return: 0 },
    { period: 'Q4 2025', return: 0 },
    { period: 'Q1 2026', return: 0 },
    { period: 'Q2 2026', return: 0 },
  ];

  let positiveCount = 0;
  quarters.forEach((q) => {
    const val = Math.round((rng() * 40 - 8) * 10) / 10;
    q.return = val;
    if (val > 0) positiveCount++;
  });

  // Ensure at least 3/4 are positive
  if (positiveCount < 3) {
    for (const q of quarters) {
      if (q.return <= 0 && positiveCount < 3) {
        q.return = Math.round((5 + rng() * 20) * 10) / 10;
        positiveCount++;
      }
    }
  }

  return { passed: true, quarters };
}

const candles1 = generateCandles(101);
const candles2 = generateCandles(202);
const candles3 = generateCandles(303);
const candles4 = generateCandles(404);
const candles5 = generateCandles(505);
const candles6 = generateCandles(606);

export const mockStrategies: Strategy[] = [
  {
    slug: 'volatility-breakout-momentum',
    name: 'Volatility Breakout Momentum',
    concept: {
      en: 'Detects sudden volatility expansion combined with volume surge to capture momentum breakouts. Uses adaptive Keltner channels calibrated to recent market regime.',
      ko: '급격한 변동성 확대와 거래량 급증을 감지하여 모멘텀 돌파를 포착합니다. 최근 시장 국면에 맞게 조정된 적응형 켈트너 채널을 사용합니다.',
    },
    status: 'live',
    coins: ['BTC', 'ETH', 'SOL', 'LINK'],
    backtestPeriod: { start: '2025-06-01', end: '2026-02-28' },
    metrics: {
      totalReturn: 247.3,
      monthlyAvgReturn: 28.4,
      maxDrawdown: 18.2,
      winRate: 72.1,
      sharpeRatio: 2.34,
      tradeWeekPct: 85,
      totalTrades: 312,
    },
    walkForward: generateWalkForward(1001),
    equityCurve: generateEquityCurve(247.3, 9, 1001),
    monthlyReturns: generateMonthlyReturns(28.4, 1001),
    trades: generateTrades(candles1, ['BTC', 'ETH', 'SOL', 'LINK'], 1001),
    candles: candles1,
    discoveredAt: '2025-07-14',
    source: 'papers',
  },
  {
    slug: 'mean-reversion-rsi-divergence',
    name: 'Mean Reversion RSI Divergence',
    concept: {
      en: 'Identifies price-RSI divergence at key support levels for mean reversion entries. Combines multi-timeframe analysis with volume profile confirmation.',
      ko: '주요 지지선에서 가격-RSI 다이버전스를 식별하여 평균 회귀 진입을 합니다. 다중 시간프레임 분석과 거래량 프로파일 확인을 결합합니다.',
    },
    status: 'testing',
    coins: ['BTC', 'ADA', 'AVAX'],
    backtestPeriod: { start: '2025-07-01', end: '2026-02-28' },
    metrics: {
      totalReturn: 156.7,
      monthlyAvgReturn: 19.6,
      maxDrawdown: 14.5,
      winRate: 65.3,
      sharpeRatio: 1.87,
      tradeWeekPct: 72,
      totalTrades: 248,
    },
    walkForward: generateWalkForward(2002),
    equityCurve: generateEquityCurve(156.7, 8, 2002),
    monthlyReturns: generateMonthlyReturns(19.6, 2002),
    trades: generateTrades(candles2, ['BTC', 'ADA', 'AVAX'], 2002),
    candles: candles2,
    discoveredAt: '2025-09-22',
    source: 'web_search',
  },
  {
    slug: 'funding-rate-arbitrage',
    name: 'Funding Rate Arbitrage',
    concept: {
      en: 'Exploits extreme funding rate imbalances as a contrarian signal. When funding rates hit extremes, the majority is positioned one way — this strategy fades the crowd.',
      ko: '극단적인 펀딩비 불균형을 역추세 신호로 활용합니다. 펀딩비가 극단에 도달하면 다수가 한쪽에 포지션을 잡고 있다는 의미이며, 이 전략은 군중의 반대편에 섭니다.',
    },
    status: 'live',
    coins: ['BTC', 'ETH', 'HBAR', 'SUI'],
    backtestPeriod: { start: '2025-07-01', end: '2026-02-28' },
    metrics: {
      totalReturn: 189.4,
      monthlyAvgReturn: 23.7,
      maxDrawdown: 22.1,
      winRate: 61.8,
      sharpeRatio: 1.92,
      tradeWeekPct: 68,
      totalTrades: 187,
    },
    walkForward: generateWalkForward(3003),
    equityCurve: generateEquityCurve(189.4, 8, 3003),
    monthlyReturns: generateMonthlyReturns(23.7, 3003),
    trades: generateTrades(candles3, ['BTC', 'ETH', 'HBAR', 'SUI'], 3003),
    candles: candles3,
    discoveredAt: '2025-08-05',
    source: 'papers',
  },
  {
    slug: 'order-flow-imbalance',
    name: 'Order Flow Imbalance',
    concept: {
      en: 'Analyzes taker buy/sell volume ratio to detect aggressive institutional accumulation or distribution phases before price moves.',
      ko: '테이커 매수/매도 거래량 비율을 분석하여 가격 변동 전 기관의 공격적 축적 또는 분배 단계를 감지합니다.',
    },
    status: 'testing',
    coins: ['BTC', 'ETH', 'SOL', 'NEAR', 'APT'],
    backtestPeriod: { start: '2025-08-01', end: '2026-02-28' },
    metrics: {
      totalReturn: 112.8,
      monthlyAvgReturn: 16.1,
      maxDrawdown: 19.7,
      winRate: 58.4,
      sharpeRatio: 1.45,
      tradeWeekPct: 62,
      totalTrades: 156,
    },
    walkForward: generateWalkForward(4004),
    equityCurve: generateEquityCurve(112.8, 7, 4004),
    monthlyReturns: generateMonthlyReturns(16.1, 4004),
    trades: generateTrades(candles4, ['BTC', 'ETH', 'SOL', 'NEAR', 'APT'], 4004),
    candles: candles4,
    discoveredAt: '2025-11-18',
    source: 'library',
  },
  {
    slug: 'weekend-gap-fill',
    name: 'Weekend Gap Fill',
    concept: {
      en: 'Exploits the tendency of crypto prices to partially revert weekend gaps during Monday Asian session. Statistical edge confirmed across 3 years of data.',
      ko: '월요일 아시아 세션 동안 주말 갭이 부분적으로 회귀하는 경향을 활용합니다. 3년간의 데이터에서 통계적 우위가 확인되었습니다.',
    },
    status: 'degraded',
    coins: ['BTC', 'ETH'],
    backtestPeriod: { start: '2025-07-01', end: '2026-02-28' },
    metrics: {
      totalReturn: 67.2,
      monthlyAvgReturn: 8.4,
      maxDrawdown: 12.3,
      winRate: 71.2,
      sharpeRatio: 1.12,
      tradeWeekPct: 28,
      totalTrades: 94,
    },
    walkForward: generateWalkForward(5005),
    equityCurve: generateEquityCurve(67.2, 8, 5005),
    monthlyReturns: generateMonthlyReturns(8.4, 5005),
    trades: generateTrades(candles5, ['BTC', 'ETH'], 5005),
    candles: candles5,
    discoveredAt: '2025-10-03',
    source: 'web_search',
  },
  {
    slug: 'multi-timeframe-trend-follower',
    name: 'Multi-Timeframe Trend Follower',
    concept: {
      en: 'Aligns trend signals across 5-min, 1-hour, and 4-hour timeframes. Only enters when all three timeframes agree on direction, with trailing stop for exit.',
      ko: '5분, 1시간, 4시간 시간프레임의 추세 신호를 정렬합니다. 세 시간프레임 모두 방향에 동의할 때만 진입하며, 트레일링 스톱으로 청산합니다.',
    },
    status: 'testing',
    coins: ['SOL', 'LINK', 'AVAX', 'SUI', 'BCH'],
    backtestPeriod: { start: '2025-09-01', end: '2026-02-28' },
    metrics: {
      totalReturn: 94.5,
      monthlyAvgReturn: 15.8,
      maxDrawdown: 25.4,
      winRate: 55.2,
      sharpeRatio: 1.28,
      tradeWeekPct: 74,
      totalTrades: 203,
    },
    walkForward: generateWalkForward(6006),
    equityCurve: generateEquityCurve(94.5, 6, 6006),
    monthlyReturns: generateMonthlyReturns(15.8, 6006),
    trades: generateTrades(candles6, ['SOL', 'LINK', 'AVAX', 'SUI', 'BCH'], 6006),
    candles: candles6,
    discoveredAt: '2025-12-11',
    source: 'library',
  },
];
