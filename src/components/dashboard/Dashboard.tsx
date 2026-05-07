import { useApp } from '@/context/AppContext';
import StockGeneral from './StockGeneral';
import StockCritico from './StockCritico';
import MetaDiaria from './MetaDiaria';
import ProductosMasVendidos from './ProductosMasVendidos';
import VentasPorMes from './VentasPorMes';

export default function Dashboard() {
  useApp();

  return (
    <div className="transition-all duration-300">
      <div className="p-6 w-full max-w-[1200px]">
      {/* Row 1: Stock General + Stock Crítico */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 mb-5">
        <StockGeneral />
        <StockCritico />
      </div>

      {/* Row 3: Productos Más Vendidos + Ventas/Mes */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 mb-5">
        <MetaDiaria />
        <ProductosMasVendidos />
        
      </div>

      {/* Row 2: Meta Diaria (full width) */}
      <div className="mb-5">
        <VentasPorMes />
      </div>

      </div>
    </div>
  );
}
