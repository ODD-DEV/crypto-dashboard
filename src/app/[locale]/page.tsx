import { getLocale, getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/lib/blog';
import { BlogFeed } from '@/components/home/BlogFeed';
import { Sidebar } from '@/components/home/Sidebar';

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const tAbout = await getTranslations('about');
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
          statusLabel={tAbout('systemStatus')}
          statsLabel={tAbout('stats')}
        />
      </div>
    </section>
  );
}
