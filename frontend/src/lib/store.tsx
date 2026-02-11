import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode
} from 'react';
import { apiRequest } from './api';
import { CartItem, ProductSize, User, Toast, ToastType } from './types';
// --- Toast Context ---
interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  register: (name: string, email: string) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
// --- Cart Context ---
interface CartContextType {
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
// --- Providers ---
export function AppProvider({ children }: {children: ReactNode;}) {
  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [
    ...prev,
    {
      id,
      message,
      type
    }]
    );
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const login = (email: string) => {
    // Mock login
    setUser({
      id: 'user-1',
      name: 'Jane Doe',
      email
    });
    addToast('Welcome back, Jane!', 'success');
  };
  const register = (name: string, email: string) => {
    // Mock register
    setUser({
      id: 'user-1',
      name,
      email
    });
    addToast('Account created successfully!', 'success');
  };
  const logout = () => {
    setUser(null);
    addToast('Logged out successfully', 'info');
  };
  // Cart State
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [guestId, setGuestId] = useState('');
  const [isCartLoading, setIsCartLoading] = useState(false);
  const GUEST_ID_KEY = 'maison-guest-id';

  const getOrCreateGuestId = () => {
    const existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;
    const fallback =
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ?
      crypto.randomUUID() :
      fallback;
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
    const headerId =
      id || guestId || localStorage.getItem(GUEST_ID_KEY) || '';
    return headerId ? { 'x-guest-id': headerId } : undefined;
  };

  type CartResponse = {
    data: {
      items: CartItem[];
      total?: number;
    };
    guestId?: string;
  };

  const syncCart = (response: CartResponse) => {
    const nextItems = response.data?.items || [];
    setItems(nextItems);
    const total =
      typeof response.data?.total === 'number' ?
      response.data.total :
      nextItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
    setCartTotal(total);
    if (response.guestId) {
      storeGuestId(response.guestId);
    }
  };

  const loadCart = async (id: string) => {
    setIsCartLoading(true);
    try {
      const response = await apiRequest<CartResponse>('/api/cart', {
        method: 'GET',
        headers: buildGuestHeaders(id)
      });
      syncCart(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load cart';
      addToast(message, 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  // Load cart from local storage on mount
  useEffect(() => {
    const storedGuestId = getOrCreateGuestId();
    storeGuestId(storedGuestId);
    loadCart(storedGuestId);
  }, []);
  const addToCart = async (
    productId: string,
    size: ProductSize,
    quantity: number
  ) => {
    setIsCartLoading(true);
    try {
      const response = await apiRequest<CartResponse>('/api/cart/items', {
        method: 'POST',
        headers: buildGuestHeaders(guestId),
        body: JSON.stringify({ productId, size, quantity })
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
      const response = await apiRequest<CartResponse>(
        `/api/cart/items/${itemId}`,
        {
          method: 'DELETE',
          headers: buildGuestHeaders(guestId)
        }
      );
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
      const response = await apiRequest<CartResponse>(
        `/api/cart/items/${itemId}`,
        {
          method: 'PATCH',
          headers: buildGuestHeaders(guestId),
          body: JSON.stringify({ quantity })
        }
      );
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
      const response = await apiRequest<CartResponse>('/api/cart', {
        method: 'DELETE',
        headers: buildGuestHeaders(guestId)
      });
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
  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast
      }}>

      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          login,
          logout,
          register
        }}>

        <CartContext.Provider
          value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            isCartLoading
          }}>

          {children}
        </CartContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>);

}
