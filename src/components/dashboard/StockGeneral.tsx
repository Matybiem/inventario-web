import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getStockStats } from '@/data/store';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function StockGeneral() {
  const { getThresholds, updateThresholds } = useApp();
  const [showConfig, setShowConfig] = useState(false);
  const [thresholds, setThresholds] = useState(getThresholds());
  const [localThresholds, setLocalThresholds] = useState(getThresholds());
  const [animatedPct, setAnimatedPct] = useState(0);
  const stats = useMemo(() => getStockStats(), [thresholds]);

  useEffect(() => {
    setThresholds(getThresholds());
  }, []);

  useEffect(() => {
    const duration = 1200;
    const start = Date.now();
    const to = stats.avgPct;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPct(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [stats.avgPct]);

  // Gauge geometry — semicircle from 135° to 405°
  const radius = 78;
  const strokeWidth = 14;
  const cx = 140;
  const cy = 110;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle; // 270°

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const criticalEnd = startAngle + (thresholds.criticalMax / 100) * totalAngle;
  const lowEnd = startAngle + (thresholds.lowMax / 100) * totalAngle;

  const needleAngle = startAngle + (animatedPct / 100) * totalAngle;
  const needlePos = polarToCartesian(needleAngle);

  // Inner point for needle (shorter, starts from center)
  const innerRadius = 18;
  const innerPos = {
    x: cx + innerRadius * Math.cos(((needleAngle - 90) * Math.PI) / 180),
    y: cy + innerRadius * Math.sin(((needleAngle - 90) * Math.PI) / 180),
  };

  // Ticks every 10%
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const handleSave = () => {
    updateThresholds({
      criticalMax: localThresholds.criticalMax,
      lowMax: localThresholds.lowMax,
    });
    setThresholds({ ...localThresholds });
    setShowConfig(false);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
      <button
        onClick={() => { setLocalThresholds(thresholds); setShowConfig(true); }}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#999] hover:text-[#1A1A1A] transition-colors"
      >
        <Settings size={16} />
      </button>

      <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-1">Stock general</h3>

      {/* Gauge */}
      <div className="flex justify-center">
        <svg width="280" height="145" viewBox="0 0 280 145">
          {/* Background arc track */}
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke="#E8E8E8"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />

          {/* Colored zones */}
          <path
            d={describeArc(startAngle, criticalEnd)}
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
          <path
            d={describeArc(criticalEnd, lowEnd)}
            fill="none"
            stroke="#EAB308"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
          <path
            d={describeArc(lowEnd, endAngle)}
            fill="none"
            stroke="#22C55E"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />

          {/* Tick marks */}
          {ticks.map(t => {
            const a = startAngle + (t / 100) * totalAngle;
            const outer = polarToCartesian(a);
            const inner = {
              x: cx + (radius - strokeWidth / 2 - 3) * Math.cos(((a - 90) * Math.PI) / 180),
              y: cy + (radius - strokeWidth / 2 - 3) * Math.sin(((a - 90) * Math.PI) / 180),
            };
            return (
              <line
                key={t}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#fff"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Scale labels 0 and 100 */}
          <text x="52" y="132" textAnchor="middle" fill="#999" fontSize="11" fontWeight="500">0</text>
          <text x="228" y="132" textAnchor="middle" fill="#999" fontSize="11" fontWeight="500">100</text>

          {/* Center value */}
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#1A1A1A" fontSize="32" fontWeight="700">
            {animatedPct}%
          </text>

          {/* Needle */}
          <line
            x1={innerPos.x}
            y1={innerPos.y}
            x2={needlePos.x}
            y2={needlePos.y}
            stroke="#1A1A1A"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Needle pivot */}
          <circle cx={cx} cy={cy} r="5.5" fill="#1A1A1A" />
          <circle cx={cx} cy={cy} r="2.5" fill="#fff" />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0"></span>
          <span className="text-[#666]">Normal [{thresholds.normalMin}%-{thresholds.normalMax}%]: {stats.normalCount} Productos</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#EAB308] shrink-0"></span>
          <span className="text-[#666]">Bajo [{thresholds.lowMin}%-{thresholds.lowMax}%]: {stats.lowCount} Productos</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0"></span>
          <span className="text-[#666]">Crítico [{thresholds.criticalMin}%-{thresholds.criticalMax}%]: {stats.criticalCount} Productos</span>
        </div>
      </div>

      {/* Config Modal */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Configurar Umbrales</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium">Máximo Crítico (%)</label>
              <input
                type="number"
                value={localThresholds.criticalMax}
                onChange={e => setLocalThresholds(prev => ({ ...prev, criticalMax: Number(e.target.value) }))}
                className="w-full h-10 mt-1 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium">Máximo Bajo (%)</label>
              <input
                type="number"
                value={localThresholds.lowMax}
                onChange={e => setLocalThresholds(prev => ({ ...prev, lowMax: Number(e.target.value) }))}
                className="w-full h-10 mt-1 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white h-10 text-[14px] font-medium"
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
