# Crypto Research Notes — Blog Redesign Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the corporate "AI Crypto Strategy Lab" website into a personal geeky research blog called "Crypto Research Notes"

**Architecture:** Next.js 16 blog with GA4 analytics, Supabase backend (separate from ERP), automated data pipeline from EC2 ai-researcher. Blog-first design where strategy test posts are the main content, with interactive chart pages (/lab/[slug]) as data viewers.

**Tech Stack:** Next.js 16, Tailwind v4, next-intl (en/ko), Supabase (new project), Vercel, GA4, MDX

---

## Decisions

- **Name**: Crypto Research Notes
- **Tone**: Geeky/nerdy, humorous, 1st person, Korean-first then English translation
- **Structure**: Home=blog feed, /posts/[slug]=blog posts, /lab/[slug]=chart/metric viewer, /about
- **Content**: Existing strategy MDX moved to blog posts with tone rewrite, strategy pages keep only charts/metrics
- **Analytics**: Google Analytics 4
- **Infra**: New Supabase project (separate from ERP), new Vercel project
- **Pipeline**: EC2 ai-researcher pushes to Supabase, auto-generates blog content via Claude API

## Page Structure

```
/                     -> Blog feed (latest posts, chronological)
/posts/[slug]         -> Blog post detail (1st person experiment log)
/lab/[slug]           -> Strategy data viewer (charts, metrics only)
/about                -> About page + system status sidebar widget
```

### Removed Pages
- /strategies (list) -> Home feed replaces this
- /dashboard -> Sidebar widget in About
- /blog -> Home IS the blog

### Header
- Home | About + locale switcher
- Simple, no mega-nav

## Content Structure

### Blog Post Format (strategy test posts)
1. Discovery background - "Found this in a paper/library..."
2. Strategy concept - geeky explanation
3. Backtest setup - "Set it up like this and ran it"
4. Results analysis - "Results came out like this, honestly..."
5. Walk-forward - "Does it work in practice?"
6. Conclusion - honest assessment + link to /lab/[slug]

### Tone Example (ko)
> "RSI 다이버전스가 크립토에서 먹힌다는 논문을 봤다. 전통 시장에서는 고전적인 전략인데, 24시간 돌아가는 크립토에서도 될까? 의심스러웠지만 일단 돌려봤다. 결론부터 말하면 — 된다. 근데 좀 웃긴 이유로."

## Infrastructure

### Supabase (NEW project, separate from ERP)
- Table: `strategies` (slug, name, status, metrics jsonb, equity_curve jsonb, candles jsonb, trades jsonb, walk_forward jsonb, monthly_returns jsonb, coins text[], backtest_period jsonb, discovered_at, source)
- Table: `posts` (slug, strategy_slug FK, title_ko, title_en, description_ko, description_en, content_ko, content_en, published_at, category)
- RLS: public read, service_role write only

### Vercel
- New project (separate from ERP)
- Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_BASE_URL

### Data Pipeline (EC2 -> Supabase)
- ai-researcher adds Supabase client
- On strategy completion: INSERT into strategies table
- Claude API generates blog post (ko+en) -> INSERT into posts table
- Call Vercel deploy hook -> auto rebuild

## Analytics
- GA4 via next/script (afterInteractive)
- NEXT_PUBLIC_GA_ID environment variable
- Page view tracking automatic
- Custom events later (strategy views, lab interactions)
