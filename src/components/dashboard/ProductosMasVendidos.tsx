import { useState, useMemo } from 'react';
import { getTopSoldProducts } from '@/data/store';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './ProductosMasVendidos.css';

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
    <div className="productos-mas-vendidos-container">
      <h3 className="productos-mas-vendidos-title">Productos más vendidos</h3>
      <p className="productos-mas-vendidos-subtitle">Mes actual</p>

      <table className="productos-mas-vendidos-table">
        <thead className="productos-mas-vendidos-thead">
          <tr>
            <th className="productos-mas-vendidos-th">Producto</th>
            <th
              className="productos-mas-vendidos-th productos-mas-vendidos-th-center productos-mas-vendidos-th-sortable"
              onClick={() => toggleSort('quantity')}
            >
              Ventas {sortIcon('quantity')}
            </th>
            <th
              className="productos-mas-vendidos-th productos-mas-vendidos-th-right productos-mas-vendidos-th-sortable"
              onClick={() => toggleSort('amount')}
            >
              Monto {sortIcon('amount')}
            </th>
          </tr>
        </thead>
        <tbody className="productos-mas-vendidos-tbody">
          {topProducts.map((item, i) => (
            <tr
              key={item.product.id}
              className="productos-mas-vendidos-tr"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <td className="productos-mas-vendidos-td">{item.product.name}</td>
              <td className="productos-mas-vendidos-td productos-mas-vendidos-td-center">
                <span className="productos-mas-vendidos-trend">
                  {item.quantity}
                  {item.trend === 'up' ? (
                    <TrendingUp size={14} className="productos-mas-vendidos-trend-up" />
                  ) : (
                    <TrendingDown size={14} className="productos-mas-vendidos-trend-down" />
                  )}
                </span>
              </td>
              <td className="productos-mas-vendidos-td productos-mas-vendidos-td-right">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {topProducts.length === 0 && (
            <tr>
              <td colSpan={3} className="productos-mas-vendidos-empty">
                No hay ventas este mes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
