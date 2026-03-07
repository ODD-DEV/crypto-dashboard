import { mockPipelineStats } from '@/data/mock-dashboard';

interface Props {
  statusLabel: string;
  statsLabel: string;
}

export function Sidebar({ statusLabel, statsLabel }: Props) {
  const stats = mockPipelineStats;

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {statsLabel}
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Strategies tested</dt>
            <dd className="font-mono text-text-primary">{stats.total.generated.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">WF pass rate</dt>
            <dd className="font-mono text-accent-profit">
              {((stats.total.wfPassed / stats.total.backtestPassed) * 100).toFixed(1)}%
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Paper trading</dt>
            <dd className="font-mono text-text-primary">{stats.total.paperTrading}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {statusLabel}
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Last research run</dt>
            <dd className="font-mono text-xs text-text-primary">{stats.systemStatus.lastResearchRun}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Coins tracked</dt>
            <dd className="font-mono text-text-primary">{stats.systemStatus.coinsTracked}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Health</dt>
            <dd className="font-mono text-accent-profit">{stats.systemStatus.dataCollectionHealth}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
