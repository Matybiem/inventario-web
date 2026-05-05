import { useState, useEffect, useCallback } from 'react';
import { getCriticalStockProducts, getThresholds } from '@/data/store';
import type { Product } from '@/types';

export default function StockCritico() {
  const [products, setProducts] = useState<Product[]>([]);
  const [thresholds, setThresholds] = useState(getThresholds());

  const refresh = useCallback(() => {
    setProducts(getCriticalStockProducts(3));
    setThresholds(getThresholds());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const getStockColor = (stock: number) => {
    const maxStock = Math.max(...products.map(p => p.stock), 1);
    const pct = (stock / maxStock) * 100;
    if (pct <= thresholds.criticalMax) return 'text-[#EF4444]';
    if (pct <= thresholds.lowMax) return 'text-[#EAB308]';
    return 'text-[#22C55E]';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">Stock crítico</h3>

      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E5E5]">
            <th className="text-left text-[12px] uppercase text-[#666] font-medium pb-2">Propietario</th>
            <th className="text-right text-[12px] uppercase text-[#666] font-medium pb-2">Unidades</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr
              key={product.id}
              className="border-b border-[#E5E5E5] last:border-0 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            >
              <td className="py-3 text-[14px] text-[#1A1A1A]">{product.name}</td>
              <td className={`py-3 text-[14px] font-bold text-right ${getStockColor(product.stock)}`}>
                {product.stock}
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={2} className="py-6 text-center text-[13px] text-[#999]">
                No hay productos con stock bajo
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="text-[11px] text-[#999] mt-3">Actualizado en tiempo real</p>
    </div>
  );
}
