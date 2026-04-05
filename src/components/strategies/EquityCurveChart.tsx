'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EquityCurveChartProps {
  data: { date: string; value: number }[];
}

function fmtDollar(n: number): string {
  if (Math.abs(n) >= 1000) {
    return `$${(n / 1000).toFixed(1)}K`;
  }
  return `$${Math.round(n)}`;
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-6">
      <h3 className="mb-3 font-[family-name:var(--font-jetbrains)] text-xs font-semibold text-text-primary sm:mb-4 sm:text-sm">
        Equity Curve
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            tickFormatter={(v: string) => v.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v: number) => fmtDollar(v)}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f2e',
              border: '1px solid #1e293b',
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 11,
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Equity']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#equityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
