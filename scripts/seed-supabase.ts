/**
 * Seed Supabase with mock strategy data and blog posts.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL in .env.local
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  // Dynamic import of mock strategies
  const { mockStrategies } = await import('../src/data/mock-strategies');

  // Insert strategies
  console.log('Seeding strategies...');
  for (const s of mockStrategies) {
    const { error } = await supabase.from('strategies').upsert(
      {
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
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`  Error: ${s.slug}:`, error.message);
    } else {
      console.log(`  OK: ${s.slug}`);
    }
  }

  // Insert blog posts from MDX files
  console.log('\nSeeding blog posts...');
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  const enDir = path.join(blogDir, 'en');
  const koDir = path.join(blogDir, 'ko');

  if (!fs.existsSync(enDir)) {
    console.log('  No blog posts found');
    return;
  }

  const enFiles = fs.readdirSync(enDir).filter((f) => f.endsWith('.mdx'));

  for (const file of enFiles) {
    const slug = file.replace('.mdx', '');
    const enRaw = fs.readFileSync(path.join(enDir, file), 'utf-8');
    const koPath = path.join(koDir, file);
    const koRaw = fs.existsSync(koPath)
      ? fs.readFileSync(koPath, 'utf-8')
      : null;

    const enParsed = matter(enRaw);
    const koParsed = koRaw ? matter(koRaw) : null;

    const { error } = await supabase.from('posts').upsert(
      {
        slug,
        strategy_slug: enParsed.data.strategySlug || null,
        title_en: enParsed.data.title,
        title_ko: koParsed?.data.title || enParsed.data.title,
        description_en: enParsed.data.description,
        description_ko:
          koParsed?.data.description || enParsed.data.description,
        content_en: enParsed.content,
        content_ko: koParsed?.content || enParsed.content,
        category: enParsed.data.category || 'General',
        published_at: enParsed.data.date,
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`  Error: ${slug}:`, error.message);
    } else {
      console.log(`  OK: ${slug}`);
    }
  }

  console.log('\nSeed complete!');
}

seed().catch(console.error);
