'use client';

import { PipelineStats } from '@/types/strategy';
import { useTranslations } from 'next-intl';

interface SystemStatusProps {
  status: PipelineStats['systemStatus'];
}

const healthColors: Record<string, string> = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ${diffMin % 60}m ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function SystemStatus({ status }: SystemStatusProps) {
  const t = useTranslations('dashboard');

  const items = [
    {
      label: 'Data Collection',
      value: (
        <span className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${healthColors[status.dataCollectionHealth]}`}
          />
          <span className="capitalize">{status.dataCollectionHealth}</span>
        </span>
      ),
    },
    {
      label: 'Last Research Run',
      value: getRelativeTime(status.lastResearchRun),
    },
    {
      label: 'DB Size',
      value: status.dbSize,
    },
    {
      label: 'Coins Tracked',
      value: status.coinsTracked,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">
        {t('systemStatus')}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-text-muted">{item.label}</span>
            <span className="font-[family-name:var(--font-jetbrains)] text-sm text-text-primary">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
