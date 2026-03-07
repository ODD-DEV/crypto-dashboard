'use client';

interface MiniEquityCurveProps {
  data: { date: string; value: number }[];
}

export function MiniEquityCurve({ data }: MiniEquityCurveProps) {
  if (!data.length) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const isPositive = values[values.length - 1] >= values[0];
  const color = isPositive ? '#00d4ff' : '#ff3366';

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 40 - ((d.value - min) / range) * 36 + 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
