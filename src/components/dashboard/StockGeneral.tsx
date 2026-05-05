import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getStockStats } from '@/data/store';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import './StockGeneral.css';

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

  const radius = 85;
  const strokeWidth = 28;
  const centerX = 150;
  const centerY = 150;
  const semicircumference = Math.PI * radius;
  const grayLength = semicircumference;

  const redLength = Math.max(0, Math.min(thresholds.criticalMax, 100) / 100) * semicircumference;
  const yellowLength = Math.max(
    0,
    Math.min(Math.max(thresholds.lowMax - thresholds.criticalMax, 0), 100) / 100,
  ) * semicircumference;
  const greenLength = Math.max(0, (100 - Math.min(thresholds.lowMax, 100)) / 100) * semicircumference;

  const yellowOffset = -redLength;
  const greenOffset = -(redLength + yellowLength);

  const handleSave = () => {
    updateThresholds({
      criticalMax: localThresholds.criticalMax,
      lowMax: localThresholds.lowMax,
    });
    setThresholds({ ...localThresholds });
    setShowConfig(false);
  };

  return (
    <div className="stock-general-container">
      <button
        onClick={() => { setLocalThresholds(thresholds); setShowConfig(true); }}
        className="stock-general-settings-btn"
      >
        <Settings size={16} />
      </button>

      <h3 className="stock-general-title">Stock general</h3>

      {/* Gauge */}
      <div className="stock-general-gauge-container">
        <div className="stock-general-gauge-wrapper">
          <svg viewBox="0 0 300 170" className="stock-general-svg">
            <defs>
              <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${grayLength} ${semicircumference * 2}`}
              strokeDashoffset={0}
              transform={`rotate(180 ${centerX} ${centerY})`}
              className="stock-general-gauge-bg"
            />

            {redLength > 0 && (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#EF4444"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${redLength} ${semicircumference * 2}`}
                strokeDashoffset={0}
                transform={`rotate(180 ${centerX} ${centerY})`}
                className="stock-general-gauge-red"
              />
            )}

            {yellowLength > 0 && (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#EAB308"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${yellowLength} ${semicircumference * 2}`}
                strokeDashoffset={yellowOffset}
                transform={`rotate(180 ${centerX} ${centerY})`}
                className="stock-general-gauge-yellow"
              />
            )}

            {greenLength > 0 && (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#22C55E"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${greenLength} ${semicircumference * 2}`}
                strokeDashoffset={greenOffset}
                transform={`rotate(180 ${centerX} ${centerY})`}
                className="stock-general-gauge-green"
              />
            )}

            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              className="stock-general-percentage-text"
            >
              {animatedPct}%
            </text>

            <text
              x={centerX - radius - 20}
              y={centerY + 8}
              textAnchor="end"
              className="stock-general-label-0"
            >
              0
            </text>

            <text
              x={centerX + radius + 20}
              y={centerY + 8}
              textAnchor="start"
              className="stock-general-label-100"
            >
              100
            </text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="stock-general-legend">
        <div className="stock-general-legend-item">
          <span className="stock-general-legend-dot stock-general-legend-dot-green"></span>
          <span className="stock-general-legend-text">Normal [{thresholds.normalMin}%-{thresholds.normalMax}%]: {stats.normalCount} Productos</span>
        </div>
        <div className="stock-general-legend-item">
          <span className="stock-general-legend-dot stock-general-legend-dot-yellow"></span>
          <span className="stock-general-legend-text">Bajo [{thresholds.lowMin}%-{thresholds.lowMax}%]: {stats.lowCount} Productos</span>
        </div>
        <div className="stock-general-legend-item">
          <span className="stock-general-legend-dot stock-general-legend-dot-red"></span>
          <span className="stock-general-legend-text">Crítico [{thresholds.criticalMin}%-{thresholds.criticalMax}%]: {stats.criticalCount} Productos</span>
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
              <label className="text-[12px] uppercase text-[#999] font-medium">Porcentaje Bajo (%)</label>
              <input
                type="number"
                value={localThresholds.lowMax}
                onChange={e => setLocalThresholds(prev => ({ ...prev, lowMax: Number(e.target.value) }))}
                className="w-full h-10 mt-1 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium">Porcentaje Crítico (%)</label>
              <input
                type="number"
                value={localThresholds.criticalMax}
                onChange={e => setLocalThresholds(prev => ({ ...prev, criticalMax: Number(e.target.value) }))}
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
