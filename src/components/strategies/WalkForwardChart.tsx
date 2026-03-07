'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface WalkForwardChartProps {
  quarters: { period: string; return: number }[];
}

export function WalkForwardChart({ quarters }: WalkForwardChartProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-4 font-[family-name:var(--font-jetbrains)] text-sm font-semibold text-text-primary">
        Walk-Forward Validation
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={quarters}>
          <XAxis
            dataKey="period"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f2e',
              border: '1px solid #1e293b',
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value) => [`${value}%`, 'Return']}
          />
          <Bar dataKey="return" radius={[4, 4, 0, 0]}>
            {quarters.map((q, i) => (
              <Cell
                key={i}
                fill={q.return >= 0 ? '#00d4ff' : '#ff3366'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
