export interface Product {
  id: string;
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  cost: number;
  price: number;
  stock: number;
  location: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  saleDate: string;
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName?: string;
}

export interface DailyGoal {
  id: string;
  goalDate: string;
  targetAmount: number;
}

export interface StockThresholds {
  id: string;
  criticalMin: number;
  criticalMax: number;
  lowMin: number;
  lowMax: number;
  normalMin: number;
  normalMax: number;
  updatedAt: string;
}

export interface SearchHistoryItem {
  id: string;
  productId: string;
  searchedAt: string;
  product?: Product;
}

export type Page = 'inicio' | 'buscar' | 'venta' | 'administrar';

export type StockLevel = 'critical' | 'low' | 'normal';
