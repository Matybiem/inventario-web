import { useState, useEffect, useCallback } from 'react';
import { getCriticalStockProducts, getThresholds } from '@/data/store';
import type { Product } from '@/types';
import './StockCritico.css';

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
    if (pct <= thresholds.criticalMax) return 'stock-critico-stock-critical';
    if (pct <= thresholds.lowMax) return 'stock-critico-stock-low';
    return 'stock-critico-stock-normal';
  };

  return (
    <div className="stock-critico-container">
      <h3 className="stock-critico-title">Stock crítico</h3>

      <table className="stock-critico-table">
        <thead className="stock-critico-thead">
          <tr>
            <th className="stock-critico-th">Propietario</th>
            <th className="stock-critico-th stock-critico-th-right">Unidades</th>
          </tr>
        </thead>
        <tbody className="stock-critico-tbody">
          {products.map((product, i) => (
            <tr
              key={product.id}
              className="stock-critico-tr"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            >
              <td className="stock-critico-td">{product.name}</td>
              <td className={`stock-critico-td stock-critico-td-right ${getStockColor(product.stock)}`}>
                {product.stock}
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={2} className="stock-critico-empty">
                No hay productos con stock bajo
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="stock-critico-footer">Actualizado en tiempo real</p>
    </div>
  );
}
