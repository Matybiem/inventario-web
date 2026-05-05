import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNextProductId(existingIds: string[]): string {
  const maxNum = existingIds.reduce((max, id) => {
    const num = parseInt(id, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return String(maxNum + 1).padStart(4, '0');
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-CL')}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('es-CL');
}

export function getStockLevelColor(stock: number, maxStock: number, thresholds: { criticalMax: number; lowMax: number }): string {
  const pct = (stock / maxStock) * 100;
  if (pct <= thresholds.criticalMax) return '#EF4444';
  if (pct <= thresholds.lowMax) return '#EAB308';
  return '#22C55E';
}
