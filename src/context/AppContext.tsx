import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product, Sale, DailyGoal, StockThresholds, Page } from '@/types';
import * as store from '@/data/store';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  products: Product[];
  sales: Sale[];
  refreshData: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => Product | null;
  toggleProductStatus: (id: string) => Product | null;
  createSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Sale;
  getDailyGoal: (date?: string) => DailyGoal;
  updateDailyGoal: (date: string, amount: number) => DailyGoal;
  getThresholds: () => StockThresholds;
  updateThresholds: (t: Partial<StockThresholds>) => StockThresholds;
  toasts: Toast[];
  showToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
  syncStatus: 'connected' | 'disconnected';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('inicio');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected'>('connected');

  const refreshData = useCallback(() => {
    setProducts(store.getProducts());
    setSales(store.getSales());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync status check every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        store.getProducts();
        setSyncStatus('connected');
      } catch {
        setSyncStatus('disconnected');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = store.createProduct(product);
    refreshData();
    showToast('Producto creado exitosamente', 'success');
    return newProduct;
  }, [refreshData, showToast]);

  const updateProductFn = useCallback((id: string, updates: Partial<Product>) => {
    const result = store.updateProduct(id, updates);
    refreshData();
    return result;
  }, [refreshData]);

  const toggleProductStatusFn = useCallback((id: string) => {
    const result = store.toggleProductStatus(id);
    refreshData();
    if (result) {
      showToast(`Producto ${result.status ? 'activado' : 'desactivado'}`, result.status ? 'success' : 'error');
    }
    return result;
  }, [refreshData, showToast]);

  const createSaleFn = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale = store.createSale(sale);
    refreshData();
    showToast('Venta registrada exitosamente', 'success');
    return newSale;
  }, [refreshData, showToast]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        products,
        sales,
        refreshData,
        addProduct,
        updateProduct: updateProductFn,
        toggleProductStatus: toggleProductStatusFn,
        createSale: createSaleFn,
        getDailyGoal: store.getDailyGoal,
        updateDailyGoal: store.updateDailyGoal,
        getThresholds: store.getThresholds,
        updateThresholds: store.updateThresholds,
        toasts,
        showToast,
        removeToast,
        syncStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
