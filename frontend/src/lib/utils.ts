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

export const DEFAULT_TAX_RATE = 0.08;

export function calculateTax(
  subtotal: number,
  rate: number = DEFAULT_TAX_RATE
): number {
  return Number((subtotal * rate).toFixed(2));
}

export function calculateTotal(
  subtotal: number,
  rate: number = DEFAULT_TAX_RATE
): number {
  return Number((subtotal + calculateTax(subtotal, rate)).toFixed(2));
}

export function generateOrderId(): string {
  return `ORD-${Math.floor(Math.random() * 1000000).
  toString().
  padStart(6, '0')}`;
}

export function formatCategory(category: Category): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
