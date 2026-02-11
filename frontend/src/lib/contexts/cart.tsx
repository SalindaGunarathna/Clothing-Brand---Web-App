import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  addCartItem,
  clearCart as clearCartRequest,
  fetchCart,
  fetchUserCart,
  removeCartItem,
  updateCartItem
} from '../cartApi';
import type { CartResponse } from '../cartApi';
import type { CartItem, ProductSize, ToastType } from '../types';

export interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, size: ProductSize, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

const GUEST_ID_KEY = 'maison-guest-id';

export function useCartState(
  addToast: (message: string, type: ToastType) => void,
  token: string | null
): {
  contextValue: CartContextType;
  loadCart: (id?: string) => Promise<void>;
  guestId: string;
} {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [guestId, setGuestId] = useState('');
  const [isCartLoading, setIsCartLoading] = useState(false);

  const getOrCreateGuestId = () => {
    const existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;
    const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : fallback;
    localStorage.setItem(GUEST_ID_KEY, id);
    return id;
  };

  const storeGuestId = (id: string) => {
    if (id) {
      localStorage.setItem(GUEST_ID_KEY, id);
    } else {
      localStorage.removeItem(GUEST_ID_KEY);
    }
    setGuestId(id);
  };

  const buildGuestHeaders = (id?: string) => {
    const headerId = id || guestId || localStorage.getItem(GUEST_ID_KEY) || '';
    return headerId ? { 'x-guest-id': headerId } : undefined;
  };

  const getCartHeaders = () => {
    if (token) {
      return { authorization: `Bearer ${token}` };
    }
    return buildGuestHeaders(guestId);
  };

  const syncCart = (response: CartResponse) => {
    const nextItems = response.data?.items || [];
    setItems(nextItems);
    const total =
      typeof response.data?.total === 'number'
        ? response.data.total
        : nextItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
    setCartTotal(total);
    if (response.guestId) {
      storeGuestId(response.guestId);
    }
  };

  const loadCart = async (id?: string) => {
    setIsCartLoading(true);
    try {
      const response =
        token && !id
          ? await fetchUserCart(token)
          : await fetchCart(id ? buildGuestHeaders(id) : getCartHeaders());
      syncCart(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load cart';
      addToast(message, 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    const storedGuestId = getOrCreateGuestId();
    storeGuestId(storedGuestId);
    loadCart(storedGuestId);
  }, []);

  useEffect(() => {
    if (token) {
      loadCart();
    }
  }, [token]);

  const addToCart = async (
    productId: string,
    size: ProductSize,
    quantity: number
  ) => {
    setIsCartLoading(true);
    try {
      const response = await addCartItem(getCartHeaders(), {
        productId,
        size,
        quantity
      });
      syncCart(response);
      addToast('Added to cart', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add to cart';
      addToast(message, 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsCartLoading(true);
    try {
      const response = await removeCartItem(getCartHeaders(), itemId);
      syncCart(response);
      addToast('Item removed from cart', 'info');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove item';
      addToast(message, 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    setIsCartLoading(true);
    try {
      const response = await updateCartItem(getCartHeaders(), itemId, {
        quantity
      });
      syncCart(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update quantity';
      addToast(message, 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  const clearCart = async () => {
    setIsCartLoading(true);
    try {
      const response = await clearCartRequest(getCartHeaders());
      syncCart(response);
      addToast('Cart cleared', 'info');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to clear cart';
      addToast(message, 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return {
    contextValue: {
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartLoading
    },
    loadCart,
    guestId
  };
}

export function CartProvider({
  children,
  value
}: {
  children: React.ReactNode;
  value: CartContextType;
}) {
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
