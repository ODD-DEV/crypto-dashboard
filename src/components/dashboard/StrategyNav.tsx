'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';

const strategies = [
  { slug: 'portfolio', label: 'All', color: '#00d4ff' },
  { slug: 'vwap', label: 'VWAP', color: '#818cf8' },
  { slug: 'consol', label: 'Consol', color: '#f472b6' },
  { slug: 'dipbuy', label: 'DipBuy', color: '#34d399' },
  { slug: 'live', label: 'Live', color: '#f59e0b' },
];

export function StrategyNav() {
  const pathname = usePathname();
  const activeSlug = pathname.split('/dashboard/')[1] || 'portfolio';

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-3 sm:mb-8 sm:gap-2 sm:pb-4">
      {strategies.map((s) => {
        const isActive = activeSlug === s.slug;
        return (
          <Link
            key={s.slug}
            href={`/dashboard/${s.slug}`}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              isActive
                ? 'bg-bg-card text-text-primary'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-secondary'
            }`}
            style={isActive ? { borderBottom: `2px solid ${s.color}` } : {}}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
