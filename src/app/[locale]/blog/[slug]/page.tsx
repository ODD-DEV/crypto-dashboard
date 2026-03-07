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

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | AI Crypto Strategy Lab`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(slug, locale);

  if (!post) {
    notFound();
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aicryptolab.vercel.app';

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        date={post.date}
        url={`${BASE_URL}/${locale}/blog/${slug}`}
      />
      <AdSlot slot="blog-post-top" className="mb-8" />

      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-accent-muted/20 px-2.5 py-0.5 text-xs font-medium text-accent-muted">
          {post.category}
        </span>
        <span className="text-xs text-text-muted">{post.date}</span>
        <span className="text-xs text-text-muted">{post.readingTime}</span>
      </div>

      <article className="prose prose-sm prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary prose-a:text-accent-profit prose-a:no-underline hover:prose-a:underline">
        <MDXRemote source={post.content} />
      </article>

      {post.relatedStrategies && post.relatedStrategies.length > 0 && (
        <div className="mt-12 rounded-xl border border-border bg-bg-card p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Related Strategies
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.relatedStrategies.map((s) => (
              <Link
                key={s}
                href={`/strategies/${s}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-accent-profit transition-colors hover:bg-bg-card-hover"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdSlot slot="blog-post-bottom" className="mt-8" />
    </section>
  );
}
