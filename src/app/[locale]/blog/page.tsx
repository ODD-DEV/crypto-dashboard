import { getLocale, getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/lib/blog';
import { Link } from '@/i18n/navigation';
import { AdSlot } from '@/components/ui/AdSlot';

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getTranslations('blog');
  const posts = getAllPosts(locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">
        {t('title')}
      </h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl border border-border bg-bg-card p-6 transition-colors hover:bg-bg-card-hover"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full bg-accent-muted/20 px-2.5 py-0.5 text-xs font-medium text-accent-muted">
                {post.category}
              </span>
              <span className="text-xs text-text-muted">{post.date}</span>
              <span className="text-xs text-text-muted">
                {post.readingTime}
              </span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">
              {post.title}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {post.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <AdSlot slot="blog-list-bottom" />
      </div>
    </section>
  );
}
