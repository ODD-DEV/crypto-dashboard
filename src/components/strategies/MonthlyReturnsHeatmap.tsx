'use client';

interface MonthlyReturnsHeatmapProps {
  data: { month: string; return: number }[];
}

export function MonthlyReturnsHeatmap({ data }: MonthlyReturnsHeatmapProps) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.return)), 1);

  // Group by year
  const years: Record<string, { month: string; return: number }[]> = {};
  for (const d of data) {
    const year = d.month.slice(0, 4);
    if (!years[year]) years[year] = [];
    years[year].push(d);
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-6">
      <h3 className="mb-3 font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-text-primary sm:mb-4 sm:text-sm">
        Monthly Returns
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {Object.entries(years).map(([year, months]) => (
          <div key={year}>
            <div className="mb-1.5 font-[family-name:var(--font-jetbrains)] text-[10px] font-medium text-text-muted sm:mb-2 sm:text-xs">
              {year}
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:grid-cols-6">
              {months.map((d) => {
                const intensity = Math.abs(d.return) / maxAbs;
                const isPositive = d.return >= 0;
                const bgColor = isPositive
                  ? `rgba(0, 212, 255, ${intensity * 0.4})`
                  : `rgba(255, 51, 102, ${intensity * 0.4})`;
                const textColor = isPositive ? '#00d4ff' : '#ff3366';

                return (
                  <div
                    key={d.month}
                    className="flex flex-col items-center justify-center rounded-lg p-2 sm:p-3"
                    style={{ backgroundColor: bgColor }}
                  >
                    <span className="text-[9px] text-text-muted sm:text-xs">{d.month.slice(5)}</span>
                    <span
                      className="font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold sm:text-sm"
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
        ))}
      </div>
    </div>
  );
}
