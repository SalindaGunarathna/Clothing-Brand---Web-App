import { apiRequest } from './api';
import type { CartItem, ProductSize } from './types';

export type CartResponse = {
  data: {
    items: CartItem[];
    total?: number;
  };
  guestId?: string;
};

export async function fetchCart(headers?: HeadersInit): Promise<CartResponse> {
  return apiRequest<CartResponse>('/api/cart', {
    method: 'GET',
    headers
  });
}

export async function fetchUserCart(token: string): Promise<CartResponse> {
  return apiRequest<CartResponse>('/api/cart/me', {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` }
  });
}

export type CartTotalResponse = {
  total: number;
  itemCount: number;
  guestId?: string;
};

export async function fetchCartTotal(
  headers?: HeadersInit
): Promise<CartTotalResponse> {
  return apiRequest<CartTotalResponse>('/api/cart/total', {
    method: 'GET',
    headers
  });
}

export async function addCartItem(
  headers: HeadersInit | undefined,
  payload: {
    productId: string;
    size: ProductSize;
    quantity: number;
  }
): Promise<CartResponse> {
  return apiRequest<CartResponse>('/api/cart/items', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
}

export async function updateCartItem(
  headers: HeadersInit | undefined,
  itemId: string,
  payload: { quantity: number }
): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload)
  });
}

export async function removeCartItem(
  headers: HeadersInit | undefined,
  itemId: string
): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers
  });
}

export async function clearCart(
  headers: HeadersInit | undefined
): Promise<CartResponse> {
  return apiRequest<CartResponse>('/api/cart', {
    method: 'DELETE',
    headers
  });
}
