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
