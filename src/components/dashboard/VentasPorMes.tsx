import { useMemo } from 'react';
import { getMonthlySales } from '@/data/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import './VentasPorMes.css';

export default function VentasPorMes() {
  const data = useMemo(() => getMonthlySales(), []);

  const maxVal = Math.max(...data.map(d => d.amount), 1);
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="ventas-por-mes-tooltip">
          <p className="ventas-por-mes-tooltip-label">{label}</p>
          <p className="ventas-por-mes-tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ventas-por-mes-container">
      <h3 className="ventas-por-mes-title">Ventas/Mes</h3>

      <div className="ventas-por-mes-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#E5E5E5' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#999' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: number) => {
                if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
                return `$${val}`;
              }}
              ticks={yTicks}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar
              dataKey="amount"
              fill="#1A1A1A"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              animationDuration={800}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
