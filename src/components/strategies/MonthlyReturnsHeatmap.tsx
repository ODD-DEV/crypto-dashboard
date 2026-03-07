'use client';

interface MonthlyReturnsHeatmapProps {
  data: { month: string; return: number }[];
}

export function MonthlyReturnsHeatmap({ data }: MonthlyReturnsHeatmapProps) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.return)), 1);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
        Monthly Returns
      </h3>
      <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
        {data.map((d) => {
          const intensity = Math.abs(d.return) / maxAbs;
          const isPositive = d.return >= 0;
          const bgColor = isPositive
            ? `rgba(0, 212, 255, ${intensity * 0.4})`
            : `rgba(255, 51, 102, ${intensity * 0.4})`;
          const textColor = isPositive ? '#00d4ff' : '#ff3366';

          return (
            <div
              key={d.month}
              className="flex flex-col items-center justify-center rounded-lg p-3"
              style={{ backgroundColor: bgColor }}
            >
              <span className="text-xs text-text-muted">{d.month.slice(5)}</span>
              <span
                className="font-[family-name:var(--font-jetbrains)] text-sm font-semibold"
                style={{ color: textColor }}
              >
                {d.return > 0 ? '+' : ''}
                {d.return}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
