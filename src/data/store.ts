import type { Product, Sale, DailyGoal, StockThresholds, SearchHistoryItem } from '@/types';
import { initialProducts, initialSales, initialDailyGoal, initialThresholds, initialSearchHistory } from './mockData';

const KEYS = {
  products: 'inv_products',
  sales: 'inv_sales',
  dailyGoals: 'inv_daily_goals',
  thresholds: 'inv_thresholds',
  searchHistory: 'inv_search_history',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;

  if (!localStorage.getItem(KEYS.products)) {
    setItem(KEYS.products, initialProducts);
    setItem(KEYS.sales, initialSales);
    setItem(KEYS.dailyGoals, [initialDailyGoal]);
    setItem(KEYS.thresholds, initialThresholds);
    setItem(KEYS.searchHistory, initialSearchHistory);
  }
}

// Products
export function getProducts(): Product[] {
  ensureInit();
  return getItem<Product[]>(KEYS.products, initialProducts);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}

export function getProductByProductId(productId: string): Product | undefined {
  return getProducts().find(p => p.productId === productId);
}

export function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts();
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  setItem(KEYS.products, [...products, newProduct]);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
  setItem(KEYS.products, products);
  return products[idx];
}

export function toggleProductStatus(id: string): Product | null {
  const product = getProductById(id);
  if (!product) return null;
  return updateProduct(id, { status: !product.status });
}

export function updateProductStock(id: string, newStock: number): Product | null {
  return updateProduct(id, { stock: newStock });
}

export function searchProducts(query: string, activeOnly = true): Product[] {
  const products = getProducts();
  const q = query.toLowerCase().trim();
  if (!q) return activeOnly ? products.filter(p => p.status) : products;

  return products.filter(p => {
    if (activeOnly && !p.status) return false;
    const matchName = p.name.toLowerCase().includes(q);
    const matchId = p.productId.includes(q);
    return matchName || matchId;
  });
}

// Sales
export function getSales(): Sale[] {
  ensureInit();
  return getItem<Sale[]>(KEYS.sales, initialSales);
}

export function createSale(sale: Omit<Sale, 'id' | 'createdAt'>): Sale {
  const sales = getSales();
  const now = new Date().toISOString();
  const newSale: Sale = {
    ...sale,
    id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
  };
  // Update sale items with the saleId
  newSale.items = newSale.items.map(item => ({ ...item, saleId: newSale.id }));
  setItem(KEYS.sales, [newSale, ...sales]);
  return newSale;
}

export function getTodaySales(): Sale[] {
  const today = new Date().toISOString().split('T')[0];
  return getSales().filter(s => s.saleDate === today);
}

export function getMonthlySales(): { month: string; amount: number }[] {
  const sales = getSales();
  const currentYear = new Date().getFullYear();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const monthlyData = months.map((month, idx) => {
    const monthStr = String(idx + 1).padStart(2, '0');
    const monthSales = sales.filter(s => {
      const [year, monthNum] = s.saleDate.split('-');
      return parseInt(year) === currentYear && monthNum === monthStr;
    });
    const amount = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
    return { month, amount };
  });

  return monthlyData;
}

// Daily Goals
export function getDailyGoal(date?: string): DailyGoal {
  ensureInit();
  const goals = getItem<DailyGoal[]>(KEYS.dailyGoals, [initialDailyGoal]);
  const targetDate = date || new Date().toISOString().split('T')[0];
  let goal = goals.find(g => g.goalDate === targetDate);
  if (!goal) {
    goal = {
      id: `goal_${Date.now()}`,
      goalDate: targetDate,
      targetAmount: 200000,
    };
    setItem(KEYS.dailyGoals, [...goals, goal]);
  }
  return goal;
}

export function updateDailyGoal(date: string, targetAmount: number): DailyGoal {
  const goals = getItem<DailyGoal[]>(KEYS.dailyGoals, [initialDailyGoal]);
  const idx = goals.findIndex(g => g.goalDate === date);
  if (idx >= 0) {
    goals[idx] = { ...goals[idx], targetAmount };
  } else {
    goals.push({
      id: `goal_${Date.now()}`,
      goalDate: date,
      targetAmount,
    });
  }
  setItem(KEYS.dailyGoals, goals);
  return goals[idx >= 0 ? idx : goals.length - 1];
}

// Thresholds
export function getThresholds(): StockThresholds {
  ensureInit();
  return getItem<StockThresholds>(KEYS.thresholds, initialThresholds);
}

export function updateThresholds(updates: Partial<StockThresholds>): StockThresholds {
  const thresholds = getThresholds();
  const updated = { ...thresholds, ...updates, updatedAt: new Date().toISOString() };
  setItem(KEYS.thresholds, updated);
  return updated;
}

// Search History
export function getSearchHistory(): SearchHistoryItem[] {
  ensureInit();
  return getItem<SearchHistoryItem[]>(KEYS.searchHistory, initialSearchHistory);
}

export function addToSearchHistory(productId: string) {
  const history = getSearchHistory();
  const filtered = history.filter(h => h.productId !== productId);
  const newEntry: SearchHistoryItem = {
    id: `sh_${Date.now()}`,
    productId,
    searchedAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...filtered].slice(0, 20);
  setItem(KEYS.searchHistory, updated);
  return updated;
}

// Stats helpers
export function getStockStats() {
  const products = getProducts();
  const thresholds = getThresholds();
  const maxStock = Math.max(...products.map(p => p.stock), 1);

  const levels = products.map(p => {
    const pct = Math.round((p.stock / maxStock) * 100);
    if (pct <= thresholds.criticalMax) return 'critical' as const;
    if (pct <= thresholds.lowMax) return 'low' as const;
    return 'normal' as const;
  });

  const criticalCount = levels.filter(l => l === 'critical').length;
  const lowCount = levels.filter(l => l === 'low').length;
  const normalCount = levels.filter(l => l === 'normal').length;
  const avgPct = products.length > 0
    ? Math.round(products.reduce((sum, p) => sum + (p.stock / maxStock) * 100, 0) / products.length)
    : 0;

  return { avgPct, criticalCount, lowCount, normalCount, thresholds };
}

export function getCriticalStockProducts(limit = 3): Product[] {
  return getProducts()
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

export function getTopSoldProducts(limit = 5): { product: Product; quantity: number; amount: number; trend: 'up' | 'down' }[] {
  const sales = getSales();
  const products = getProducts();
  const currentMonth = new Date().getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const currentYear = new Date().getFullYear();
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const productSales: Record<string, { currentQty: number; currentAmount: number; prevQty: number }> = {};

  sales.forEach(sale => {
    const [year, month] = sale.saleDate.split('-').map(Number);
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { currentQty: 0, currentAmount: 0, prevQty: 0 };
      }
      if (month === currentMonth && year === currentYear) {
        productSales[item.productId].currentQty += item.quantity;
        productSales[item.productId].currentAmount += item.subtotal;
      }
      if (month === prevMonth && year === prevYear) {
        productSales[item.productId].prevQty += item.quantity;
      }
    });
  });

  return Object.entries(productSales)
    .map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      return {
        product,
        quantity: data.currentQty,
        amount: data.currentAmount,
        trend: (data.prevQty === 0 || data.currentQty >= data.prevQty) ? 'up' as const : 'down' as const,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function getUniqueLocations(): string[] {
  const products = getProducts();
  const locations = new Set(products.map(p => p.location));
  return Array.from(locations).sort();
}

export function getFilterRanges() {
  const products = getProducts();
  const costs = products.map(p => p.cost);
  const prices = products.map(p => p.price);
  const stocks = products.map(p => p.stock);

  return {
    cost: { min: Math.min(...costs), max: Math.max(...costs) },
    price: { min: Math.min(...prices), max: Math.max(...prices) },
    stock: { min: Math.min(...stocks), max: Math.max(...stocks) },
  };
}
