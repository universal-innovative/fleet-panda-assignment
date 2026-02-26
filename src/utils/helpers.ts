import type { ProductType, OrderStatus } from '../types';

// ─── Date Formatting ────────────────────────────────────────────

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Number Formatting ──────────────────────────────────────────

export function formatQuantity(qty: number): string {
  if (qty >= 1000) return `${(qty / 1000).toFixed(1)}K`;
  return qty.toString();
}

export function formatLiters(qty: number): string {
  return `${qty.toLocaleString()} L`;
}

// ─── Product Helpers ────────────────────────────────────────────

export const PRODUCT_COLORS: Record<ProductType, string> = {
  diesel: '#3b82f6',
  petrol: '#10b981',
  kerosene: '#f59e0b',
  lpg: '#8b5cf6',
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  diesel: 'Diesel',
  petrol: 'Petrol',
  kerosene: 'Kerosene',
  lpg: 'LPG',
};

export const PRODUCTS: ProductType[] = ['diesel', 'petrol', 'kerosene', 'lpg'];

export function getProductLabel(product: ProductType): string {
  return PRODUCT_LABELS[product] || product.toUpperCase();
}

// ─── Status Helpers ─────────────────────────────────────────────

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-surface-100', text: 'text-surface-600', dot: 'bg-surface-400' },
  assigned: { bg: 'bg-brand-50', text: 'text-brand-700', dot: 'bg-brand-500' },
  'in-transit': { bg: 'bg-warning-50', text: 'text-warning-600', dot: 'bg-warning-400' },
  delivered: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  failed: { bg: 'bg-danger-50', text: 'text-danger-700', dot: 'bg-danger-500' },
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  failed: 'Failed',
};

// ─── Inventory Alerts ───────────────────────────────────────────

export function getInventoryLevel(quantity: number): 'critical' | 'low' | 'normal' | 'high' {
  if (quantity <= 1000) return 'critical';
  if (quantity <= 3000) return 'low';
  if (quantity <= 10000) return 'normal';
  return 'high';
}

export const INVENTORY_COLORS = {
  critical: { bg: 'bg-danger-50', text: 'text-danger-700', bar: 'bg-danger-500' },
  low: { bg: 'bg-warning-50', text: 'text-warning-600', bar: 'bg-warning-400' },
  normal: { bg: 'bg-brand-50', text: 'text-brand-700', bar: 'bg-brand-500' },
  high: { bg: 'bg-success-50', text: 'text-success-700', bar: 'bg-success-500' },
};

// ─── Validation ─────────────────────────────────────────────────

export function validatePhone(phone: string): boolean {
  return /^\+?[\d\s-()]{10,}$/.test(phone);
}

export function validateLicense(license: string): boolean {
  return /^[A-Z]{2}-\d{4,}$/.test(license);
}

export function validateRegistration(reg: string): boolean {
  return /^[A-Z]{2,4}-\d{2,4}$/.test(reg);
}

// ─── Misc ───────────────────────────────────────────────────────

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
