import { useState, useMemo, useEffect } from 'react';
import { searchProducts, getSearchHistory, addToSearchHistory, getFilterRanges, getUniqueLocations } from '@/data/store';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, X } from 'lucide-react';

interface Filters {
  costMin: number;
  costMax: number;
  priceMin: number;
  priceMax: number;
  stockMin: number;
  stockMax: number;
  locations: string[];
}

export default function Buscador() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [historyProducts, setHistoryProducts] = useState<Product[]>([]);

  const ranges = useMemo(() => getFilterRanges(), []);
  const allLocations = useMemo(() => getUniqueLocations(), []);

  const [filters, setFilters] = useState<Filters>({
    costMin: ranges.cost.min,
    costMax: ranges.cost.max,
    priceMin: ranges.price.min,
    priceMax: ranges.price.max,
    stockMin: ranges.stock.min,
    stockMax: ranges.stock.max,
    locations: [],
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters | null>(null);

  // Load history on mount
  useEffect(() => {
    const history = getSearchHistory();
    const products = searchProducts('', false);
    const historyWithProducts = history
      .map(h => {
        const prod = products.find(p => p.id === h.productId);
        return prod || null;
      })
      .filter((p): p is Product => p !== null && p.status)
      .slice(0, 10);
    setHistoryProducts(historyWithProducts);
  }, []);

  // Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const products = searchProducts(query, true);

    if (appliedFilters) {
      const filtered = products.filter(p => {
        if (p.cost < appliedFilters.costMin || p.cost > appliedFilters.costMax) return false;
        if (p.price < appliedFilters.priceMin || p.price > appliedFilters.priceMax) return false;
        if (p.stock < appliedFilters.stockMin || p.stock > appliedFilters.stockMax) return false;
        if (appliedFilters.locations.length > 0 && !appliedFilters.locations.includes(p.location)) return false;
        return true;
      });
      setResults(filtered);
    } else {
      setResults(products);
    }
  }, [query, appliedFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && results.length > 0) {
      addToSearchHistory(results[0].id);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      costMin: ranges.cost.min,
      costMax: ranges.cost.max,
      priceMin: ranges.price.min,
      priceMax: ranges.price.max,
      stockMin: ranges.stock.min,
      stockMax: ranges.stock.max,
      locations: [],
    });
    setAppliedFilters(null);
  };

  const toggleLocation = (loc: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(loc)
        ? prev.locations.filter(l => l !== loc)
        : [...prev.locations, loc],
    }));
  };

  const hasActiveFilters = appliedFilters !== null;

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1A1A1A] mb-4">Buscador</h1>

        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full h-[44px] pl-10 pr-4 border border-[#D0D0D0] rounded-lg text-[14px] text-[#1A1A1A] placeholder:text-[#999] focus:border-[#1A1A1A] focus:outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className={`
              flex items-center gap-2 px-4 h-[44px] border rounded-lg text-[14px] font-medium transition-colors
              ${hasActiveFilters
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                : 'border-[#D0D0D0] text-[#666] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
              }
            `}
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#F5A623]"></span>}
          </button>
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-2.5 border border-[#D0D0D0] rounded-lg text-[#666] hover:border-[#1A1A1A] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      {query.trim() ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-[#1A1A1A]">
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <ProductTable products={results} emptyMessage="No se encontraron productos" />
        </div>
      ) : (
        <div>
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">Recientes</h2>
          <ProductTable products={historyProducts} emptyMessage="No hay búsquedas recientes" />
        </div>
      )}

      {/* Filter Drawer */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[320px] bg-white z-50 shadow-[-4px_0_12px_rgba(0,0,0,0.1)] animate-in slide-in-from-right-300 duration-300 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Filtros</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearFilters}
                    className="text-[13px] text-[#666] hover:text-[#1A1A1A] transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-1.5 bg-[#1A1A1A] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Costo */}
              <FilterRange
                label="Costo"
                min={ranges.cost.min}
                max={ranges.cost.max}
                valueMin={filters.costMin}
                valueMax={filters.costMax}
                prefix="$"
                onChangeMin={v => setFilters(prev => ({ ...prev, costMin: v }))}
                onChangeMax={v => setFilters(prev => ({ ...prev, costMax: v }))}
              />

              {/* Precio */}
              <FilterRange
                label="Precio"
                min={ranges.price.min}
                max={ranges.price.max}
                valueMin={filters.priceMin}
                valueMax={filters.priceMax}
                prefix="$"
                onChangeMin={v => setFilters(prev => ({ ...prev, priceMin: v }))}
                onChangeMax={v => setFilters(prev => ({ ...prev, priceMax: v }))}
              />

              {/* Stock */}
              <FilterRange
                label="Stock (unidades)"
                min={ranges.stock.min}
                max={ranges.stock.max}
                valueMin={filters.stockMin}
                valueMax={filters.stockMax}
                prefix=""
                onChangeMin={v => setFilters(prev => ({ ...prev, stockMin: v }))}
                onChangeMax={v => setFilters(prev => ({ ...prev, stockMax: v }))}
              />

              {/* Ubicación */}
              <div className="mb-5">
                <label className="text-[12px] uppercase text-[#999] font-medium block mb-3">Ubicación</label>
                <div className="grid grid-cols-3 gap-2">
                  {allLocations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => toggleLocation(loc)}
                      className={`
                        px-2 py-1.5 text-[13px] rounded-lg border transition-colors
                        ${filters.locations.includes(loc)
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-transparent text-[#666] border-[#D0D0D0] hover:border-[#1A1A1A]'
                        }
                      `}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Product Table component
function ProductTable({ products, emptyMessage }: { products: Product[]; emptyMessage: string }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-[#E5E5E5]">
            <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3">id_producto</th>
            <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3">Producto</th>
            <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3">Costo</th>
            <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3">Precio</th>
            <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3">Stock</th>
            <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3">Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr
              key={product.id}
              className={`border-b border-[#E5E5E5] last:border-0 hover:bg-[#FAFAFA] transition-colors ${product.stock < 50 ? 'bg-yellow-50/50' : ''}`}
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <td className="px-4 py-2.5 text-[14px] text-[#1A1A1A] font-mono">{product.productId}</td>
              <td className="px-4 py-2.5 text-[14px] text-[#1A1A1A]">{product.name}</td>
              <td className="px-4 py-2.5 text-[14px] text-[#666] text-right">{formatCurrency(product.cost)}</td>
              <td className="px-4 py-2.5 text-[14px] text-[#666] text-right">{formatCurrency(product.price)}</td>
              <td className="px-4 py-2.5 text-[14px] text-right">
                <span className={product.stock < 50 ? 'text-[#EAB308] font-bold' : 'text-[#1A1A1A]'}>
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-2.5 text-[14px] text-[#666]">{product.location}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#999]">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Filter Range Slider component
function FilterRange({
  label,
  min,
  max,
  valueMin,
  valueMax,
  prefix,
  onChangeMin,
  onChangeMax,
}: {
  label: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  prefix: string;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[12px] uppercase text-[#999] font-medium">{label}</label>
        <span className="text-[13px] text-[#1A1A1A] font-medium">
          {prefix}{valueMin.toLocaleString('es-CL')} - {prefix}{valueMax.toLocaleString('es-CL')}
        </span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-[#E5E5E5] rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#1A1A1A] rounded-full"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={e => onChangeMin(Math.min(Number(e.target.value), valueMax))}
          className="absolute w-full top-0 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1A1A1A] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md h-5"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={e => onChangeMax(Math.max(Number(e.target.value), valueMin))}
          className="absolute w-full top-0 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1A1A1A] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md h-5"
        />
      </div>
    </div>
  );
}
