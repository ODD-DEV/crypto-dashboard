import { MetadataRoute } from 'next';
import { mockStrategies } from '@/data/mock-strategies';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aicryptolab.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ko'];
  const entries: MetadataRoute.Sitemap = [];

  const pages = ['', '/strategies', '/dashboard', '/blog'];
  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: { en: `${BASE_URL}/en${page}`, ko: `${BASE_URL}/ko${page}` },
        },
      });
    }
  }

  for (const strategy of mockStrategies) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/strategies/${strategy.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/strategies/${strategy.slug}`,
            ko: `${BASE_URL}/ko/strategies/${strategy.slug}`,
          },
        },
      });
    }
  }

  for (const locale of locales) {
    const posts = getAllPosts(locale);
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/blog/${post.slug}`,
            ko: `${BASE_URL}/ko/blog/${post.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
