# Crypto Research Notes — Blog Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform "AI Crypto Strategy Lab" (corporate SaaS website) into "Crypto Research Notes" (personal geeky research blog) with GA4 analytics, Supabase backend, and automated data pipeline.

**Architecture:** Blog-first Next.js 16 app. Home page = blog feed. Strategy data lives in /lab/[slug] as interactive chart viewer. Content stored in MDX files (Phase 1) with Supabase backend for future automation. GA4 for visitor tracking.

**Tech Stack:** Next.js 16, Tailwind v4, next-intl, Supabase (new project), Vercel, GA4, MDX, Recharts, Lightweight Charts

---

## Layer 1: Frontend Redesign

### Task 1: Update branding — messages, metadata, JsonLd

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/ko.json`
- Modify: `src/components/seo/JsonLd.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Update en.json**

Replace entire file with:

```json
{
  "meta": {
    "title": "Crypto Research Notes",
    "description": "One nerd's quest to find crypto trading strategies that actually work. AI-generated, rigorously tested, honestly reported."
  },
  "nav": {
    "home": "Home",
    "about": "About"
  },
  "home": {
    "title": "Research Notes",
    "subtitle": "I let AI generate trading strategies, then torture-test them until they confess whether they actually work.",
    "recentPosts": "Recent Posts",
    "allPosts": "All Posts",
    "readMore": "Read more",
    "minRead": "min read",
    "labLink": "View backtest data"
  },
  "about": {
    "title": "About",
    "systemStatus": "System Status",
    "stats": "Stats"
  },
  "lab": {
    "title": "Backtest Lab",
    "backToPost": "Back to post",
    "metrics": {
      "return": "Cumulative",
      "mdd": "MDD",
      "winRate": "Win Rate",
      "sharpe": "Sharpe"
    }
  },
  "footer": {
    "disclaimer": "This is a personal research blog. Not financial advice. Past performance does not guarantee future results. I'm just a nerd with a keyboard.",
    "rights": "All rights reserved."
  }
}
```

**Step 2: Update ko.json**

```json
{
  "meta": {
    "title": "크립토 리서치 노트",
    "description": "실제로 먹히는 크립토 트레이딩 전략을 찾아 헤매는 한 너드의 기록. AI가 만들고, 빡세게 테스트하고, 솔직하게 기록합니다."
  },
  "nav": {
    "home": "홈",
    "about": "소개"
  },
  "home": {
    "title": "리서치 노트",
    "subtitle": "AI한테 트레이딩 전략을 만들게 하고, 진짜 되는지 안 되는지 고문 수준으로 테스트하는 블로그입니다.",
    "recentPosts": "최근 글",
    "allPosts": "전체 글 보기",
    "readMore": "더 읽기",
    "minRead": "분 소요",
    "labLink": "백테스트 데이터 보기"
  },
  "about": {
    "title": "소개",
    "systemStatus": "시스템 상태",
    "stats": "통계"
  },
  "lab": {
    "title": "백테스트 랩",
    "backToPost": "글로 돌아가기",
    "metrics": {
      "return": "누적수익률",
      "mdd": "최대 낙폭",
      "winRate": "승률",
      "sharpe": "샤프 비율"
    }
  },
  "footer": {
    "disclaimer": "개인 리서치 블로그입니다. 투자 조언이 아닙니다. 과거 실적이 미래 수익을 보장하지 않습니다. 저는 그냥 키보드 든 너드입니다.",
    "rights": "All rights reserved."
  }
}
```

**Step 3: Update JsonLd.tsx**

Change all `'AI Crypto Strategy Lab'` references to `'Crypto Research Notes'`.

In `WebsiteJsonLd`:
```typescript
name: 'Crypto Research Notes',
description: 'Personal research blog about AI-generated crypto trading strategies',
```

In `ArticleJsonLd` publisher:
```typescript
name: 'Crypto Research Notes',
```

**Step 4: Update layout.tsx metadata**

Change `title: 'AI Crypto Strategy Lab'` to `title: 'Crypto Research Notes'` and update description.

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add src/messages/ src/components/seo/JsonLd.tsx src/app/\[locale\]/layout.tsx
git commit -m "rebrand: AI Crypto Strategy Lab -> Crypto Research Notes"
```

---

### Task 2: Simplify Header — Home + About only

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Update Header**

Replace navLinks array:
```typescript
const navLinks = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
] as const;
```

Replace logo text:
```tsx
<Link href="/" className="font-[family-name:var(--font-jetbrains)] text-lg font-bold tracking-tight">
  <span className="text-text-secondary">crypto</span>
  <span className="text-text-primary">research</span>
  <span className="text-accent-profit">notes</span>
</Link>
```

**Step 2: Update Footer branding**

In `src/components/layout/Footer.tsx`, change:
```
AI CryptoLab -> Crypto Research Notes
```

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Footer.tsx
git commit -m "simplify header: Home + About, update logo"
```

---

### Task 3: Convert Home page to blog feed

**Files:**
- Rewrite: `src/app/[locale]/page.tsx`
- Create: `src/components/home/BlogFeed.tsx`
- Create: `src/components/home/Sidebar.tsx`

**Step 1: Create BlogFeed component**

Create `src/components/home/BlogFeed.tsx`:

```tsx
import { Link } from '@/i18n/navigation';
import { BlogPost } from '@/lib/blog';

interface Props {
  posts: BlogPost[];
  readMore: string;
  minRead: string;
}

export function BlogFeed({ posts, readMore, minRead }: Props) {
  if (posts.length === 0) {
    return (
      <p className="text-text-muted py-12 text-center">
        No posts yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post, i) => (
        <article
          key={post.slug}
          className={`group ${i > 0 ? 'border-t border-border pt-8' : ''}`}
        >
          <div className="mb-2 flex items-center gap-3 text-xs text-text-muted">
            <time>{post.date}</time>
            <span>{post.readingTime.replace('min read', minRead)}</span>
            <span className="rounded-full bg-accent-muted/10 px-2 py-0.5 text-accent-muted">
              {post.category}
            </span>
          </div>
          <Link href={`/posts/${post.slug}`} className="block">
            <h2 className="mb-2 text-xl font-semibold text-text-primary group-hover:text-accent-profit transition-colors">
              {post.title}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {post.description}
            </p>
            <span className="mt-2 inline-block text-sm text-accent-profit">
              {readMore} &rarr;
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
}
```

**Step 2: Create Sidebar component**

Create `src/components/home/Sidebar.tsx`:

```tsx
import { mockPipelineStats } from '@/data/mock-dashboard';

interface Props {
  statusLabel: string;
  statsLabel: string;
}

export function Sidebar({ statusLabel, statsLabel }: Props) {
  const stats = mockPipelineStats;

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {statsLabel}
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Strategies tested</dt>
            <dd className="font-mono text-text-primary">{stats.total.generated.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">WF pass rate</dt>
            <dd className="font-mono text-accent-profit">
              {((stats.total.wfPassed / stats.total.backtestPassed) * 100).toFixed(1)}%
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Paper trading</dt>
            <dd className="font-mono text-text-primary">{stats.total.paperTrading}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {statusLabel}
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Last research run</dt>
            <dd className="font-mono text-text-primary text-xs">{stats.systemStatus.lastResearchRun}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Coins tracked</dt>
            <dd className="font-mono text-text-primary">{stats.systemStatus.coinsTracked}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Health</dt>
            <dd className="font-mono text-accent-profit">{stats.systemStatus.dataCollectionHealth}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
```

**Step 3: Rewrite Home page**

Rewrite `src/app/[locale]/page.tsx`:

```tsx
import { getLocale, getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/lib/blog';
import { BlogFeed } from '@/components/home/BlogFeed';
import { Sidebar } from '@/components/home/Sidebar';

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const posts = getAllPosts(locale);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-primary">{t('title')}</h1>
        <p className="mt-2 text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <BlogFeed
          posts={posts}
          readMore={t('readMore')}
          minRead={t('minRead')}
        />
        <Sidebar
          statusLabel={t('title')}
          statsLabel={t('title')}
        />
      </div>
    </section>
  );
}
```

Note: We pass `about.systemStatus` and `about.stats` labels. Update the Sidebar props to use the `about` translations. Actually, since Sidebar is a server-rendered component used on Home, pass the labels directly from the page. Use `getTranslations('about')` for the sidebar labels:

```tsx
const tAbout = await getTranslations('about');
// ...
<Sidebar
  statusLabel={tAbout('systemStatus')}
  statsLabel={tAbout('stats')}
/>
```

**Step 4: Verify build**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/\[locale\]/page.tsx src/components/home/BlogFeed.tsx src/components/home/Sidebar.tsx
git commit -m "feat: convert home page to blog feed with sidebar"
```

---

### Task 4: Move strategy content to blog posts + rewrite tone

**Files:**
- Move + rewrite: `content/strategies/{en,ko}/*.mdx` → `content/blog/{en,ko}/`
- Delete: `content/strategies/` directory (after moving)
- Modify: `src/lib/blog.ts` (add `strategySlug` frontmatter field)

**Step 1: Update BlogPost type in blog.ts**

Add `strategySlug` to the interface:
```typescript
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
  content: string;
  relatedStrategies?: string[];
  strategySlug?: string;
}
```

In `getPost()`, add:
```typescript
strategySlug: data.strategySlug || null,
```

**Step 2: Rewrite all 6 strategy MDX files as blog posts**

Each file needs:
- New frontmatter with `date`, `category: "Strategy Test"`, `strategySlug`
- 1st person geeky tone
- Link to `/lab/[slug]` for chart data

Example: `content/blog/ko/volatility-breakout-momentum.mdx`:

```mdx
---
title: "변동성 돌파 모멘텀 — 논문에서 본 걸 직접 돌려봤다"
description: "켈트너 채널 기반 변동성 돌파 전략을 크립토에서 테스트한 기록. 결론부터 말하면, 꽤 잘 된다."
date: "2025-07-14"
category: "Strategy Test"
strategySlug: "volatility-breakout-momentum"
---

## 발견

변동성 돌파 전략 논문을 읽다가 눈에 띈 게 하나 있었다. 대부분의 변동성 돌파 전략이 고정된 채널 폭을 쓰는데, 이 논문은 **적응형 켈트너 채널**을 사용했다. 시장 국면에 따라 채널 폭이 자동으로 조절된다는 건데, 크립토처럼 변동성이 미친 시장에서는 이게 핵심일 수 있겠다 싶었다.

솔직히 "변동성 돌파"라는 말 자체가 너무 많이 들어서 또 하나의 뻔한 전략이겠거니 했다. 근데 적응형 채널이라는 부분이 걸렸다. 일단 돌려보자.

## 전략 개념

원리는 간단하다:

1. **켈트너 채널**을 설정한다 (20기간 EMA + ATR 기반 밴드)
2. 근데 밴드 폭을 고정하지 않고, **최근 20일 변동성의 백분위**에 따라 조절
3. 가격이 상단 밴드를 뚫으면서 **거래량이 20기간 평균의 1.5배** 이상이면 → 롱 진입
4. 트레일링 스톱으로 청산 (2x ATR → 수익 증가 시 1.2x ATR로 축소)

핵심은 "변동성이 낮은 구간에서 채널이 좁아져서, 진짜 돌파가 일어날 때 더 빠르게 잡는다"는 것이다.

## 백테스트 셋업

- **기간**: 2025-06 ~ 2026-02 (9개월)
- **코인**: BTC, ETH, SOL, LINK
- **시간프레임**: 5분봉
- **수수료**: 편도 0.05% (왕복 0.1%)
- **슬리피지**: 지정가 주문 가정

## 결과

총 312번 거래해서 **누적 수익률 247.3%**. 월평균 28.4%라는 숫자가 나왔다.

[상세 백테스트 데이터 보기 →](/lab/volatility-breakout-momentum)

승률은 72.1%인데, 이게 좀 인상적이었다. 보통 모멘텀 전략은 승률이 낮고 큰 수익으로 만회하는 구조인데, 이 전략은 승률도 높고 평균 수익도 괜찮았다. 적응형 채널이 거짓 돌파를 많이 걸러주는 것 같다.

최대 낙폭은 -18.2%. 크립토 치고는 양호한 편이다. 샤프 비율 2.34.

## Walk-Forward 검증

백테스트 좋은 건 아무나 한다. 진짜 중요한 건 **아웃오브샘플**에서도 먹히느냐.

4분기 중 3분기에서 양의 수익. 1분기 손실은 시장이 완전 횡보할 때 발생했다 — 이건 모멘텀 전략의 숙명이라 어쩔 수 없다.

## 솔직한 평가

**좋은 점:**
- 적응형 채널이 진짜 차이를 만든다. 고정 채널 대비 거짓 돌파 50% 이상 감소
- 크립토의 "갑자기 미친 듯이 움직이는" 특성에 잘 맞음
- 거래량 필터가 없었으면 승률이 훨씬 낮았을 것

**걱정되는 점:**
- 횡보장에서는 확실히 약하다
- 9개월 백테스트가 충분한 기간인지는 의문
- 현재 paper trading 중이니 실제 결과를 더 봐야 함

현재 상태: **Live** — paper trading에서도 비슷한 패턴을 보이고 있어서 라이브로 전환함.
```

All 6 strategies need similar rewrites in both ko and en. The en version should feel like a natural English blog post, not a translation:

`content/blog/en/volatility-breakout-momentum.mdx`:

```mdx
---
title: "Volatility Breakout Momentum — I Tested That Paper's Claims"
description: "Testing a Keltner channel-based volatility breakout strategy on crypto. TLDR: it actually works, and here's why."
date: "2025-07-14"
category: "Strategy Test"
strategySlug: "volatility-breakout-momentum"
---

## Discovery

I was reading through volatility breakout papers when something caught my eye. Most breakout strategies use fixed channel widths, but this one used **adaptive Keltner channels** that auto-adjust to the current market regime. In a market as volatile as crypto, that could be the difference between catching real breakouts and getting wrecked by fakeouts.

Honestly, "volatility breakout" is such an overused phrase that I almost scrolled past it. But the adaptive channel part was intriguing. Let's run it.

## The Concept

The logic is straightforward:

1. Set up a **Keltner channel** (20-period EMA + ATR-based bands)
2. But instead of fixed band width, adjust it based on the **percentile rank of recent 20-day volatility**
3. When price breaks above the upper band AND **volume exceeds 1.5x the 20-period average** → long entry
4. Exit via trailing stop (2x ATR → tightens to 1.2x ATR as profit grows)

The key insight: "When volatility is low, the channel narrows, so when a real breakout happens, you catch it faster."

## Backtest Setup

- **Period**: June 2025 - Feb 2026 (9 months)
- **Coins**: BTC, ETH, SOL, LINK
- **Timeframe**: 5-minute candles
- **Fees**: 0.05% per side (0.1% round trip)
- **Slippage**: Limit order assumption

## Results

312 trades, **cumulative return of 247.3%**. That's 28.4% per month.

[View detailed backtest data →](/lab/volatility-breakout-momentum)

Win rate was 72.1%, which surprised me. Momentum strategies usually have low win rates and make up for it with big winners. This one has both a high win rate AND decent average wins. The adaptive channel seems to filter out a lot of false breakouts.

Max drawdown: -18.2%. Pretty good for crypto. Sharpe ratio: 2.34.

## Walk-Forward Validation

Good backtests are easy. The real question is whether it holds up **out of sample**.

Positive returns in 3 out of 4 quarters. The losing quarter happened during a dead-flat market — that's just what happens with momentum strategies. No surprise there.

## Honest Assessment

**The good:**
- Adaptive channels genuinely make a difference. 50%+ reduction in false breakouts vs fixed channels
- Fits crypto's "suddenly goes insane" tendency perfectly
- Without the volume filter, win rate would be much lower

**The concerns:**
- Clearly weak in ranging markets
- Is 9 months of backtest data enough? Debatable
- Currently in paper trading, need more real-world data

Current status: **Live** — paper trading showed similar patterns, so it got promoted.
```

Repeat this pattern for all 6 strategies. Each strategy should have a unique personality in the writing while maintaining the same structure.

For the remaining 5 strategies, maintain the same blog post format:
- `mean-reversion-rsi-divergence` — "RSI 다이버전스가 크립토에서 먹힌다고? 의심스러웠다"
- `funding-rate-arbitrage` — "펀딩비가 극단이면 반대로 가면 된다는데, 진짜?"
- `order-flow-imbalance` — "오더플로우 데이터로 기관 매집을 잡을 수 있을까"
- `weekend-gap-fill` — "주말 갭은 메워진다 — 이건 사실이었는데, 지금은..."
- `multi-timeframe-trend-follower` — "세 시간프레임이 동의할 때만 진입한다는 전략"

**Step 3: Remove old content/strategies/ directory**

After all files are moved and rewritten, delete `content/strategies/`.

**Step 4: Remove strategy-content.ts**

Delete `src/lib/strategy-content.ts` — no longer needed.

**Step 5: Verify build**

Run: `npm run build`

**Step 6: Commit**

```bash
git add content/ src/lib/
git rm -r content/strategies/
git rm src/lib/strategy-content.ts
git commit -m "feat: move strategy content to blog posts with 1st person tone"
```

---

### Task 5: Create /posts/[slug] page (replaces /blog/[slug])

**Files:**
- Create: `src/app/[locale]/posts/[slug]/page.tsx`
- Delete: `src/app/[locale]/blog/` directory (both page.tsx and [slug]/page.tsx)

**Step 1: Create posts/[slug]/page.tsx**

```tsx
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPost } from '@/lib/blog';
import { Link } from '@/i18n/navigation';
import { AdSlot } from '@/components/ui/AdSlot';
import { ArticleJsonLd } from '@/components/seo/JsonLd';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'ko'];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const posts = getAllPosts(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug, locale);
  if (!post) return { title: 'Not Found' };
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cryptoresearch.notes';
  return {
    title: `${post.title} | Crypto Research Notes`,
    description: post.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/posts/${slug}`,
      languages: {
        en: `${BASE_URL}/en/posts/${slug}`,
        ko: `${BASE_URL}/ko/posts/${slug}`,
      },
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(slug, locale);
  if (!post) notFound();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cryptoresearch.notes';

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        date={post.date}
        url={`${BASE_URL}/${locale}/posts/${slug}`}
      />

      <div className="mb-6 flex items-center gap-3 text-xs text-text-muted">
        <time>{post.date}</time>
        <span>{post.readingTime}</span>
        <span className="rounded-full bg-accent-muted/10 px-2 py-0.5 text-accent-muted">
          {post.category}
        </span>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-text-primary">{post.title}</h1>

      <AdSlot slot="post-top" className="mb-8" />

      <article className="prose prose-sm prose-invert max-w-none prose-headings:font-[family-name:var(--font-jetbrains)] prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary prose-a:text-accent-profit prose-a:no-underline hover:prose-a:underline prose-code:text-accent-profit prose-h2:text-xl prose-h3:text-lg prose-h2:mt-8 prose-h3:mt-6">
        <MDXRemote source={post.content} />
      </article>

      {post.strategySlug && (
        <div className="mt-10 rounded-xl border border-accent-profit/30 bg-accent-profit/5 p-6">
          <p className="text-sm text-text-secondary">
            Want to see the actual charts and numbers?
          </p>
          <Link
            href={`/lab/${post.strategySlug}`}
            className="mt-2 inline-block text-sm font-semibold text-accent-profit hover:underline"
          >
            View backtest data in the lab &rarr;
          </Link>
        </div>
      )}

      <AdSlot slot="post-bottom" className="mt-8" />
    </section>
  );
}
```

**Step 2: Delete old blog pages**

Remove `src/app/[locale]/blog/` directory entirely.

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/app/\[locale\]/posts/
git rm -r src/app/\[locale\]/blog/
git commit -m "feat: create /posts/[slug] page, remove old /blog"
```

---

### Task 6: Create /lab/[slug] page (chart-only strategy viewer)

**Files:**
- Rename: `src/app/[locale]/strategies/[slug]/page.tsx` → `src/app/[locale]/lab/[slug]/page.tsx`
- Delete: `src/app/[locale]/strategies/` directory
- Modify: Strategy detail page to remove MDX content, add "back to post" link

**Step 1: Create lab/[slug]/page.tsx**

```tsx
import { notFound } from 'next/navigation';
import { mockStrategies } from '@/data/mock-strategies';
import { DetailHeader } from '@/components/strategies/DetailHeader';
import { EquityCurveChart } from '@/components/strategies/EquityCurveChart';
import { CandleChart } from '@/components/strategies/CandleChart';
import { MonthlyReturnsHeatmap } from '@/components/strategies/MonthlyReturnsHeatmap';
import { MetricsTable } from '@/components/strategies/MetricsTable';
import { WalkForwardChart } from '@/components/strategies/WalkForwardChart';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export function generateStaticParams() {
  return mockStrategies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const strategy = mockStrategies.find((s) => s.slug === slug);
  if (!strategy) return { title: 'Not Found' };
  return {
    title: `${strategy.name} Lab | Crypto Research Notes`,
    description: `Backtest data and charts for ${strategy.name}`,
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const strategy = mockStrategies.find((s) => s.slug === slug);
  const t = await getTranslations('lab');

  if (!strategy) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/posts/${slug}`}
        className="mb-6 inline-flex items-center text-sm text-accent-profit hover:underline"
      >
        &larr; {t('backToPost')}
      </Link>

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
    </section>
  );
}
```

**Step 2: Delete old strategies pages**

Remove `src/app/[locale]/strategies/` directory.

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/app/\[locale\]/lab/
git rm -r src/app/\[locale\]/strategies/
git commit -m "feat: create /lab/[slug] chart viewer, remove /strategies"
```

---

### Task 7: Create /about page

**Files:**
- Create: `src/app/[locale]/about/page.tsx`
- Delete: `src/app/[locale]/dashboard/page.tsx`

**Step 1: Create about/page.tsx**

```tsx
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
```

**Step 2: Delete dashboard page**

Remove `src/app/[locale]/dashboard/page.tsx`.

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/app/\[locale\]/about/
git rm src/app/\[locale\]/dashboard/page.tsx
git commit -m "feat: create /about page, remove /dashboard"
```

---

### Task 8: Update sitemap and clean up unused components

**Files:**
- Modify: `src/app/sitemap.ts`
- Delete unused: `src/components/home/HeroSection.tsx`
- Delete unused: `src/components/home/MetricCards.tsx`
- Delete unused: `src/components/home/RecentStrategies.tsx`
- Delete unused: `src/components/strategies/StrategyListClient.tsx`
- Delete unused: `src/components/strategies/StrategyCard.tsx`
- Delete unused: `src/components/strategies/StrategyFilters.tsx`
- Delete unused: `src/components/dashboard/FunnelChart.tsx`
- Delete unused: `src/components/dashboard/PaperTradingTable.tsx`

**Step 1: Update sitemap.ts**

```typescript
import { MetadataRoute } from 'next';
import { mockStrategies } from '@/data/mock-strategies';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cryptoresearch.notes';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ko'];
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const pages = ['', '/about'];
  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1 : 0.5,
        alternates: {
          languages: { en: `${BASE_URL}/en${page}`, ko: `${BASE_URL}/ko${page}` },
        },
      });
    }
  }

  // Blog posts
  for (const locale of locales) {
    const posts = getAllPosts(locale);
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/${locale}/posts/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/posts/${post.slug}`,
            ko: `${BASE_URL}/ko/posts/${post.slug}`,
          },
        },
      });
    }
  }

  // Lab pages
  for (const strategy of mockStrategies) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/lab/${strategy.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/lab/${strategy.slug}`,
            ko: `${BASE_URL}/ko/lab/${strategy.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
```

**Step 2: Delete unused components**

```bash
rm src/components/home/HeroSection.tsx
rm src/components/home/MetricCards.tsx
rm src/components/home/RecentStrategies.tsx
rm src/components/strategies/StrategyListClient.tsx
rm src/components/strategies/StrategyCard.tsx
rm src/components/strategies/StrategyFilters.tsx
rm src/components/dashboard/FunnelChart.tsx
rm src/components/dashboard/PaperTradingTable.tsx
```

Keep: `SystemStatus.tsx` (used in Sidebar), `MiniEquityCurve.tsx` (may be useful), all chart components in strategies/.

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/app/sitemap.ts
git rm src/components/home/HeroSection.tsx src/components/home/MetricCards.tsx src/components/home/RecentStrategies.tsx src/components/strategies/StrategyListClient.tsx src/components/strategies/StrategyCard.tsx src/components/strategies/StrategyFilters.tsx src/components/dashboard/FunnelChart.tsx src/components/dashboard/PaperTradingTable.tsx
git commit -m "update sitemap for new routes, remove unused components"
```

---

### Task 9: Add Google Analytics 4

**Files:**
- Create: `src/components/analytics/GoogleAnalytics.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Create GA component**

Create `src/components/analytics/GoogleAnalytics.tsx`:

```tsx
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
```

**Step 2: Add to layout.tsx**

Import and add `<GoogleAnalytics />` inside `<body>`, before `<WebsiteJsonLd />`:

```tsx
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
// ...
<body className={...}>
  <GoogleAnalytics />
  <WebsiteJsonLd />
  // ...
```

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/components/analytics/GoogleAnalytics.tsx src/app/\[locale\]/layout.tsx
git commit -m "feat: add Google Analytics 4"
```

---

## Layer 2: Infrastructure

### Task 10: Set up Supabase project

**This task is manual + code.**

**Step 1: Create Supabase project**

Go to https://supabase.com/dashboard and create a NEW project:
- Organization: Create new org (separate from ERP!) OR use same org but different project
- Project name: `crypto-research-notes`
- Region: Northeast Asia (ap-northeast-2) or closest
- Database password: generate and save securely

**Step 2: Create database schema**

Run this SQL in Supabase SQL Editor:

```sql
-- Strategies table (backtest data)
CREATE TABLE strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'testing' CHECK (status IN ('testing', 'live', 'degraded', 'failed')),
  coins TEXT[] NOT NULL DEFAULT '{}',
  backtest_period JSONB NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}',
  walk_forward JSONB NOT NULL DEFAULT '{}',
  equity_curve JSONB NOT NULL DEFAULT '[]',
  monthly_returns JSONB NOT NULL DEFAULT '[]',
  trades JSONB NOT NULL DEFAULT '[]',
  candles JSONB NOT NULL DEFAULT '[]',
  concept_en TEXT,
  concept_ko TEXT,
  source TEXT CHECK (source IN ('papers', 'library', 'web_search')),
  discovered_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  strategy_slug TEXT REFERENCES strategies(slug),
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  description_en TEXT NOT NULL,
  content_ko TEXT NOT NULL,
  content_en TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Strategy Test',
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read strategies" ON strategies FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);

-- Service role write access (for EC2 pipeline)
CREATE POLICY "Service write strategies" ON strategies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write posts" ON posts FOR ALL USING (true) WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER strategies_updated_at BEFORE UPDATE ON strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Step 3: Get API keys**

From Supabase dashboard → Settings → API:
- Copy `Project URL` → this becomes `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → this becomes `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → this becomes `SUPABASE_SERVICE_ROLE_KEY` (for EC2 pipeline only)

**Step 4: Create .env.local**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_BASE_URL=https://cryptoresearch.notes
```

**Step 5: Install Supabase client**

```bash
npm install @supabase/supabase-js
```

**Step 6: Create Supabase client utility**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 7: Commit**

```bash
git add src/lib/supabase.ts package.json package-lock.json
git commit -m "feat: add Supabase client (new project, separate from ERP)"
```

---

### Task 11: Seed Supabase with mock data

**Files:**
- Create: `scripts/seed-supabase.ts`

**Step 1: Create seed script**

Create `scripts/seed-supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as matter from 'gray-matter';

// Use service role key for seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Import strategy data (copy from mock-strategies.ts logic)
// This script reads the mock data and inserts into Supabase

async function seed() {
  // Dynamic import of mock data
  const { mockStrategies } = await import('../src/data/mock-strategies');

  // Insert strategies
  for (const s of mockStrategies) {
    const { error } = await supabase.from('strategies').upsert({
      slug: s.slug,
      name: s.name,
      status: s.status,
      coins: s.coins,
      backtest_period: s.backtestPeriod,
      metrics: s.metrics,
      walk_forward: s.walkForward,
      equity_curve: s.equityCurve,
      monthly_returns: s.monthlyReturns,
      trades: s.trades,
      candles: s.candles,
      concept_en: s.concept.en,
      concept_ko: s.concept.ko,
      source: s.source,
      discovered_at: s.discoveredAt,
    }, { onConflict: 'slug' });

    if (error) {
      console.error(`Error inserting strategy ${s.slug}:`, error);
    } else {
      console.log(`Inserted strategy: ${s.slug}`);
    }
  }

  // Insert blog posts from MDX files
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  const enDir = path.join(blogDir, 'en');
  const koDir = path.join(blogDir, 'ko');

  const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.mdx'));

  for (const file of enFiles) {
    const slug = file.replace('.mdx', '');
    const enRaw = fs.readFileSync(path.join(enDir, file), 'utf-8');
    const koPath = path.join(koDir, file);
    const koRaw = fs.existsSync(koPath) ? fs.readFileSync(koPath, 'utf-8') : null;

    const enParsed = matter(enRaw);
    const koParsed = koRaw ? matter(koRaw) : null;

    const { error } = await supabase.from('posts').upsert({
      slug,
      strategy_slug: enParsed.data.strategySlug || null,
      title_en: enParsed.data.title,
      title_ko: koParsed?.data.title || enParsed.data.title,
      description_en: enParsed.data.description,
      description_ko: koParsed?.data.description || enParsed.data.description,
      content_en: enParsed.content,
      content_ko: koParsed?.content || enParsed.content,
      category: enParsed.data.category || 'General',
      published_at: enParsed.data.date,
    }, { onConflict: 'slug' });

    if (error) {
      console.error(`Error inserting post ${slug}:`, error);
    } else {
      console.log(`Inserted post: ${slug}`);
    }
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
```

**Step 2: Add seed script to package.json**

Add to scripts:
```json
"seed": "npx tsx scripts/seed-supabase.ts"
```

**Step 3: Install tsx for running TypeScript scripts**

```bash
npm install -D tsx
```

**Step 4: Run seed (after setting SUPABASE_SERVICE_ROLE_KEY in env)**

```bash
SUPABASE_SERVICE_ROLE_KEY=your_key npm run seed
```

**Step 5: Commit**

```bash
git add scripts/seed-supabase.ts package.json package-lock.json
git commit -m "feat: add Supabase seed script"
```

---

### Task 12: Deploy to Vercel

**Step 1: Create Vercel project**

```bash
npx vercel --yes
```

When prompted:
- Link to existing project? No, create new
- Project name: `crypto-research-notes`
- Framework: Next.js

**Step 2: Set environment variables**

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add NEXT_PUBLIC_GA_ID
npx vercel env add NEXT_PUBLIC_BASE_URL
```

**Step 3: Deploy**

```bash
npx vercel --prod
```

**Step 4: Get deploy hook URL (for pipeline automation)**

Go to Vercel Dashboard → Project → Settings → Git → Deploy Hooks:
- Create hook named "pipeline-deploy", branch "main"
- Save the hook URL — this will be used by EC2 pipeline

**Step 5: Commit**

```bash
git add .vercel/
git commit -m "chore: add Vercel project config"
```

---

## Layer 3: Data Pipeline

### Task 13: Add pipeline endpoint to EC2 ai-researcher

**This task modifies the EC2 ai-researcher Docker service to push strategy data and blog posts to Supabase.**

**Files (on EC2):**
- Modify: `/app/ai-researcher/` (add Supabase push logic)
- Create: `ai-researcher/supabase_publisher.py`

**Step 1: Create publisher module on EC2**

SSH into EC2 and create `supabase_publisher.py` in the ai-researcher directory:

```python
"""
Publishes completed strategies and blog posts to Supabase.
Called by ai-researcher after a strategy passes walk-forward validation.
"""
import os
import json
import requests
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
VERCEL_DEPLOY_HOOK = os.environ.get("VERCEL_DEPLOY_HOOK")
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def publish_strategy(strategy_data: dict):
    """Insert or update a strategy in Supabase."""
    result = supabase.table("strategies").upsert(strategy_data, on_conflict="slug").execute()
    print(f"Published strategy: {strategy_data['slug']}")
    return result


def generate_blog_post(strategy_data: dict) -> dict:
    """Use Claude API to generate a blog post about the strategy."""
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = f"""Write a blog post about this crypto trading strategy test.

Strategy: {strategy_data['name']}
Concept: {strategy_data.get('concept_en', '')}
Metrics: {json.dumps(strategy_data.get('metrics', {}))}
Walk-forward results: {json.dumps(strategy_data.get('walk_forward', {}))}
Status: {strategy_data.get('status', 'testing')}

Write in the style of a geeky researcher's personal notes. First person, casual but technically accurate.
Include sections: Discovery, The Concept, Backtest Setup, Results, Walk-Forward, Honest Assessment.
Be genuinely honest about limitations. Include humor naturally (not forced).
Do NOT include fake links or references to charts - just the text content.

Write the Korean version first, then the English version.
Format: Return JSON with keys: title_ko, title_en, description_ko, description_en, content_ko, content_en
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )

    # Parse the JSON from Claude's response
    text = response.content[0].text
    # Extract JSON from response (handle markdown code blocks)
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    return json.loads(text)


def publish_blog_post(strategy_data: dict, blog_data: dict):
    """Insert blog post into Supabase."""
    post = {
        "slug": strategy_data["slug"],
        "strategy_slug": strategy_data["slug"],
        "title_ko": blog_data["title_ko"],
        "title_en": blog_data["title_en"],
        "description_ko": blog_data["description_ko"],
        "description_en": blog_data["description_en"],
        "content_ko": blog_data["content_ko"],
        "content_en": blog_data["content_en"],
        "category": "Strategy Test",
        "published_at": strategy_data.get("discovered_at", None),
    }
    result = supabase.table("posts").upsert(post, on_conflict="slug").execute()
    print(f"Published blog post: {strategy_data['slug']}")
    return result


def trigger_deploy():
    """Trigger Vercel rebuild."""
    if VERCEL_DEPLOY_HOOK:
        requests.post(VERCEL_DEPLOY_HOOK)
        print("Triggered Vercel deploy")


def publish_full(strategy_data: dict):
    """Full pipeline: publish strategy + generate blog post + trigger deploy."""
    publish_strategy(strategy_data)
    blog_data = generate_blog_post(strategy_data)
    publish_blog_post(strategy_data, blog_data)
    trigger_deploy()
```

**Step 2: Add env vars to EC2 Docker**

Add to the ai-researcher service in `docker-compose.yml`:
```yaml
environment:
  - SUPABASE_URL=${SUPABASE_URL}
  - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
  - VERCEL_DEPLOY_HOOK=${VERCEL_DEPLOY_HOOK}
```

And add to `.env` on EC2:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/...
```

**Step 3: Install dependencies in ai-researcher Docker**

Add to `requirements.txt`:
```
supabase
anthropic
```

**Step 4: Integration point**

In the ai-researcher's main loop, after a strategy passes walk-forward validation, call:
```python
from supabase_publisher import publish_full
publish_full(strategy_data)
```

The exact integration point depends on the ai-researcher's code structure. Look for where strategies are saved after WF validation and add the publish call there.

**Step 5: Commit (on EC2)**

```bash
git add supabase_publisher.py requirements.txt docker-compose.yml
git commit -m "feat: add Supabase publisher for strategy pipeline"
```

---

### Task 14: Switch website from mock data to Supabase (optional/future)

**Note:** This task is optional for the initial deployment. The site works fine with mock data. When ready to switch:

**Files:**
- Create: `src/lib/strategies.ts` (Supabase fetch)
- Modify: `src/app/[locale]/lab/[slug]/page.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/posts/[slug]/page.tsx`

The key change is replacing `mockStrategies` imports with Supabase queries. Since the site uses `generateStaticParams` for SSG, the Supabase data is fetched at build time, not on every request. The Vercel deploy hook ensures rebuilds happen when new data arrives.

Create `src/lib/strategies.ts`:

```typescript
import { supabase } from './supabase';
import { Strategy } from '@/types/strategy';

export async function getAllStrategies(): Promise<Strategy[]> {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .order('discovered_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    slug: row.slug,
    name: row.name,
    concept: { en: row.concept_en, ko: row.concept_ko },
    status: row.status,
    coins: row.coins,
    backtestPeriod: row.backtest_period,
    metrics: row.metrics,
    walkForward: row.walk_forward,
    equityCurve: row.equity_curve,
    monthlyReturns: row.monthly_returns,
    trades: row.trades,
    candles: row.candles,
    discoveredAt: row.discovered_at,
    source: row.source,
  }));
}

export async function getStrategy(slug: string): Promise<Strategy | null> {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return {
    slug: data.slug,
    name: data.name,
    concept: { en: data.concept_en, ko: data.concept_ko },
    status: data.status,
    coins: data.coins,
    backtestPeriod: data.backtest_period,
    metrics: data.metrics,
    walkForward: data.walk_forward,
    equityCurve: data.equity_curve,
    monthlyReturns: data.monthly_returns,
    trades: data.trades,
    candles: data.candles,
    discoveredAt: data.discovered_at,
    source: data.source,
  };
}
```

Similarly create `src/lib/posts-db.ts` for fetching posts from Supabase instead of MDX files. This enables the full automated pipeline where ai-researcher pushes content and the site rebuilds automatically.

---

## Execution Summary

| Task | Layer | Description |
|------|-------|-------------|
| 1 | Frontend | Rebrand messages, metadata, JsonLd |
| 2 | Frontend | Simplify Header + Footer |
| 3 | Frontend | Home page → blog feed |
| 4 | Frontend | Move strategy MDX → blog posts, rewrite tone |
| 5 | Frontend | Create /posts/[slug] page |
| 6 | Frontend | Create /lab/[slug] chart viewer |
| 7 | Frontend | Create /about page |
| 8 | Frontend | Update sitemap, delete unused components |
| 9 | Frontend | Add GA4 |
| 10 | Infra | Set up Supabase project |
| 11 | Infra | Seed Supabase with mock data |
| 12 | Infra | Deploy to Vercel |
| 13 | Pipeline | EC2 publisher module |
| 14 | Pipeline | Switch to Supabase data (optional) |
