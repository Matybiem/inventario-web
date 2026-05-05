import { useState, useMemo } from 'react';
import { getTopSoldProducts } from '@/data/store';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

type SortField = 'quantity' | 'amount';
type SortDir = 'asc' | 'desc';

export default function ProductosMasVendidos() {
  const [sortField, setSortField] = useState<SortField>('quantity');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const topProducts = useMemo(() => {
    const data = getTopSoldProducts(5);
    return [...data].sort((a, b) => {
      const valA = sortField === 'quantity' ? a.quantity : a.amount;
      const valB = sortField === 'quantity' ? b.quantity : b.amount;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }, [sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-1">Productos más vendidos</h3>
      <p className="text-[12px] text-[#999] mb-4">Mes actual</p>

      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E5E5]">
            <th className="text-left text-[12px] uppercase text-[#666] font-medium pb-2">Producto</th>
            <th
              className="text-center text-[12px] uppercase text-[#666] font-medium pb-2 cursor-pointer hover:text-[#1A1A1A]"
              onClick={() => toggleSort('quantity')}
            >
              Ventas {sortIcon('quantity')}
            </th>
            <th
              className="text-right text-[12px] uppercase text-[#666] font-medium pb-2 cursor-pointer hover:text-[#1A1A1A]"
              onClick={() => toggleSort('amount')}
            >
              Monto {sortIcon('amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map((item, i) => (
            <tr
              key={item.product.id}
              className="border-b border-[#E5E5E5] last:border-0"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <td className="py-2.5 text-[14px] text-[#1A1A1A]">{item.product.name}</td>
              <td className="py-2.5 text-[14px] text-center">
                <span className="inline-flex items-center gap-1">
                  {item.quantity}
                  {item.trend === 'up' ? (
                    <TrendingUp size={14} className="text-[#22C55E]" />
                  ) : (
                    <TrendingDown size={14} className="text-[#EF4444]" />
                  )}
                </span>
              </td>
              <td className="py-2.5 text-[14px] text-right font-medium">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {topProducts.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-[13px] text-[#999]">
                No hay ventas este mes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
