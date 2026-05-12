import { useState, useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getTodaySales } from '@/data/store';
import { formatCurrency } from '@/lib/utils';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import './MetaDiaria.css';

export default function MetaDiaria() {
  const { getDailyGoal, updateDailyGoal } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const goal = useMemo(() => getDailyGoal(today), []);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempMeta, setTempMeta] = useState<string>('');
  const [animKey, setAnimKey] = useState(0);

  const todaySales = useMemo(() => getTodaySales(), []);
  const totalSalesToday = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalTransactions = todaySales.length;

  const porcentaje = goal.targetAmount > 0 ? (totalSalesToday / goal.targetAmount) * 100 : 0;

  // Gauge semicircular config
  const radius = 85;
  const centerX = 150;
  const centerY = 150;
  const semicircumference = Math.PI * radius;

  // Arco azul (0% a min(100%, porcentaje))
  const bluePercent = Math.min(porcentaje, 100);
  const blueLength = (bluePercent / 100) * semicircumference;

  // Capas de superposición cada 100% extra sobre el 100%
  const overlayColors = ['#22C55E', '#60A5FA', '#FACC15', '#F97316', '#EF4444'];
  const overlayData = porcentaje > 100
    ? overlayColors
        .map((color, index) => {
          const excessStart = 100 + index * 100;
          const excessAmount = Math.max(0, Math.min(porcentaje - excessStart, 100));
          return {
            color,
            length: (excessAmount / 100) * semicircumference,
          };
        })
        .filter((layer) => layer.length > 0)
    : [];

  const grayLength = semicircumference;

  const openMetaDialog = useCallback(() => {
    setTempMeta(goal.targetAmount.toString());
    setIsDialogOpen(true);
  }, [goal.targetAmount]);

  const saveMeta = useCallback(() => {
    const newMeta = parseInt(tempMeta.replace(/\./g, '').replace(/,/g, ''), 10);
    if (!isNaN(newMeta) && newMeta > 0) {
      updateDailyGoal(today, newMeta);
      setIsDialogOpen(false);
      setAnimKey((k) => k + 1);
    }
  }, [tempMeta, today]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveMeta();
    }
  };

  // Formatear input con separador de miles
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setTempMeta('');
      return;
    }
    const num = parseInt(raw, 10);
    setTempMeta(num.toLocaleString('es-CL'));
  };

  return (
    <div className="meta-diaria-container min-w-[400px]">
      {/* Botón de editar meta */}
      <button
        onClick={openMetaDialog}
        className="meta-diaria-settings-btn"
        title="Editar meta"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Título */}
      <h2 className="meta-diaria-title">Meta diaria</h2>

      <div className="meta-diaria-content">
        <div className="meta-diaria-content-row">
          {/* Lado izquierdo: Gauge */}
          <div className="meta-diaria-gauge-container">
            <div className="meta-diaria-gauge-wrapper">
              <svg
                viewBox="0 0 300 170"
                className="meta-diaria-svg"
              >
                {/* Definiciones para sombras */}
                <defs>
                  <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Fondo gris del semicírculo */}
                <circle
                  key={`gray-${animKey}`}
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth={28}
                  strokeLinecap="round"
                  strokeDasharray={`${grayLength} ${semicircumference * 2}`}
                  strokeDashoffset={0}
                  transform={`rotate(180 ${centerX} ${centerY})`}
                  className="meta-diaria-gauge-bg"
                />

                {/* Arco azul (progreso 0-100%) */}
                {blueLength > 0 && (
                  <circle
                    key={`blue-${animKey}`}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke="#4A7EBB"
                    strokeWidth={28}
                    strokeLinecap="round"
                    strokeDasharray={`${blueLength} ${semicircumference * 2}`}
                    strokeDashoffset={0}
                    transform={`rotate(180 ${centerX} ${centerY})`}
                    className="meta-diaria-gauge-blue"
                  />
                )}

                {/* Capas de superposición por cada 100% extra */}
                {overlayData.map((layer, index) => (
                  <circle
                    key={`overlay-${index}-${animKey}`}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={layer.color}
                    strokeWidth={28}
                    strokeLinecap="round"
                    strokeDasharray={`${layer.length} ${semicircumference * 2}`}
                    strokeDashoffset={0}
                    transform={`rotate(180 ${centerX} ${centerY})`}
                    className="meta-diaria-gauge-overlay"
                  />
                ))}

                {/* Texto del porcentaje */}
                <text
                  x={centerX}
                  y={centerY - 10}
                  textAnchor="middle"
                  className="meta-diaria-percentage-text"
                >
                  {Math.round(porcentaje)}%
                </text>

                {/* Label 0 */}
                <text
                  x={centerX - radius - 20}
                  y={centerY + 8}
                  textAnchor="end"
                  className="meta-diaria-label-0"
                >
                  0
                </text>

                {/* Label 100 */}
                <text
                  x={centerX + radius + 20}
                  y={centerY + 8}
                  textAnchor="start"
                  className="meta-diaria-label-100"
                >
                  100
                </text>
              </svg>
            </div>
          </div>

          {/* Lado derecho: Info */}
          <div className="meta-diaria-info-container">
            <div className="meta-diaria-info-item">
              <p className="meta-diaria-info-label">
                Cantidad de Ventas
              </p>
              <p className="meta-diaria-info-value">{totalTransactions}</p>
            </div>

            <div className="meta-diaria-info-item">
              <p className="meta-diaria-info-label">
                Ventas Hoy
              </p>
              <p className="meta-diaria-info-value">
                {formatCurrency(totalSalesToday)}
              </p>
            </div>

            <div className="meta-diaria-info-item">
              <p className="meta-diaria-info-label">
                Meta
              </p>
              <p className="meta-diaria-info-value">
                {formatCurrency(goal.targetAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para editar meta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Editar Meta Diaria</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="meta-input" className="text-sm font-medium">
                Monto de meta
              </label>
              <Input
                id="meta-input"
                type="text"
                value={tempMeta}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ej: 200.000"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveMeta} className="bg-blue-600 hover:bg-blue-700">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
