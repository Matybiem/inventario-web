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
  const maxVisualPercent = 150;

  // Arco azul (0% a min(100%, porcentaje))
  const bluePercent = Math.min(porcentaje, 100);
  const blueLength = (bluePercent / 100) * semicircumference;

  // Arco verde (exceso sobre 100%)
  const greenPercent =
    porcentaje > 100 ? Math.min(porcentaje - 100, maxVisualPercent - 100) : 0;
  const greenLength = (greenPercent / 100) * semicircumference;

  // Arco gris de fondo
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
    <div className="w-full max-w-[720px] mx-auto select-none">
      {/* Card principal */}
      <div className="relative bg-white rounded-2xl border-2 border-[#7DB8DA] p-6 shadow-sm">
        {/* Botón de editar meta */}
        <button
          onClick={openMetaDialog}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7DB8DA] focus:ring-offset-1"
          title="Editar meta"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Título */}
        <h2 className="text-lg font-medium text-gray-700 mb-6">Meta diaria</h2>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* Lado izquierdo: Gauge */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-[300px] h-[180px]">
              <svg
                viewBox="0 0 300 170"
                className="w-full h-full overflow-visible"
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
                  style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
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
                    style={{
                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'drop-shadow(0 2px 4px rgba(74, 126, 187, 0.3))',
                    }}
                  />
                )}

                {/* Arco verde (exceso >100%) */}
                {greenLength > 0 && (
                  <circle
                    key={`green-${animKey}`}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth={28}
                    strokeLinecap="round"
                    strokeDasharray={`${greenLength} ${semicircumference * 2}`}
                    strokeDashoffset={-blueLength}
                    transform={`rotate(180 ${centerX} ${centerY})`}
                    style={{
                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))',
                    }}
                  />
                )}

                {/* Texto del porcentaje */}
                <text
                  x={centerX}
                  y={centerY - 10}
                  textAnchor="middle"
                  className="text-4xl font-bold fill-gray-800"
                  style={{ fontSize: '42px', fontWeight: 700 }}
                >
                  {Math.round(porcentaje)}%
                </text>

                {/* Label 0 */}
                <text
                  x={centerX - radius - 5}
                  y={centerY + 8}
                  textAnchor="end"
                  className="text-xs fill-gray-400"
                  style={{ fontSize: '11px' }}
                >
                  0
                </text>

                {/* Label 100 */}
                <text
                  x={centerX + radius + 5}
                  y={centerY + 8}
                  textAnchor="start"
                  className="text-xs fill-gray-400"
                  style={{ fontSize: '11px' }}
                >
                  100
                </text>
              </svg>
            </div>
          </div>

          {/* Lado derecho: Info */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                Cantidad de Ventas
              </p>
              <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                Ventas Hoy
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalSalesToday)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                Meta
              </p>
              <p className="text-2xl font-bold text-gray-800">
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
