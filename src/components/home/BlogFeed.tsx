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
      <p className="py-12 text-center text-text-muted">
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
            <h2 className="mb-2 text-xl font-semibold text-text-primary transition-colors group-hover:text-accent-profit">
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
