import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function generateOrderId(): string {
  return `ORD-${Math.floor(Math.random() * 1000000).
  toString().
  padStart(6, '0')}`;
}

export function formatCategory(category: Category): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
