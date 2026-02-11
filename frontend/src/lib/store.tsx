import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode
} from 'react';
import { apiRequest } from './api';
import {
  CartItem,
  ProductSize,
  User,
  UserRole,
  Toast,
  ToastType
} from './types';
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
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<User>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<User>;
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
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const AUTH_KEY = 'maison-auth';
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

  type AuthResponse = {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  };

  const clearAuthStorage = () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const persistAuth = (
    auth: AuthResponse,
    rememberMe: boolean
  ) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(
      AUTH_KEY,
      JSON.stringify({ ...auth, rememberMe })
    );
    if (rememberMe) {
      sessionStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  };

  const loadStoredAuth = (): (AuthResponse & { rememberMe: boolean }) | null => {
    const local = localStorage.getItem(AUTH_KEY);
    const session = sessionStorage.getItem(AUTH_KEY);
    const raw = session || local;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse & { rememberMe: boolean };
    } catch {
      return null;
    }
  };

  const applyAuth = (auth: AuthResponse, rememberMe: boolean) => {
    setUser(auth.user);
    setToken(auth.token);
    setRefreshToken(auth.refreshToken);
    persistAuth(auth, rememberMe);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setAuthError(null);
    clearAuthStorage();
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

  const getCartHeaders = () => {
    if (token) {
      return { authorization: `Bearer ${token}` };
    }
    return buildGuestHeaders(guestId);
  };

  const loadCart = async (id?: string) => {
    setIsCartLoading(true);
    try {
      const response = await apiRequest<CartResponse>('/api/cart', {
        method: 'GET',
        headers: id ? buildGuestHeaders(id) : getCartHeaders()
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

  useEffect(() => {
    const storedAuth = loadStoredAuth();
    if (!storedAuth) return;
    if (storedAuth.refreshToken) {
      setIsAuthLoading(true);
      apiRequest<AuthResponse>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: storedAuth.refreshToken })
      })
        .then((auth) => {
          applyAuth(auth, storedAuth.rememberMe);
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => setIsAuthLoading(false));
      return;
    }
    if (storedAuth.token && storedAuth.user) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
      setRefreshToken(storedAuth.refreshToken || null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadCart();
    }
  }, [token]);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          guestId: localStorage.getItem(GUEST_ID_KEY) || undefined
        })
      });
      applyAuth(response, rememberMe);
      addToast(`Welcome back, ${response.user.name}!`, 'success');
      return response.user;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed';
      setAuthError(message);
      addToast(message, 'error');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          guestId: localStorage.getItem(GUEST_ID_KEY) || undefined
        })
      });
      applyAuth(response, rememberMe);
      addToast('Account created successfully!', 'success');
      return response.user;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      setAuthError(message);
      addToast(message, 'error');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      if (refreshToken) {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch {
      // ignore logout errors
    } finally {
      clearAuth();
      loadCart(guestId);
      addToast('Logged out successfully', 'info');
      setIsAuthLoading(false);
    }
  };
  const addToCart = async (
    productId: string,
    size: ProductSize,
    quantity: number
  ) => {
    setIsCartLoading(true);
    try {
      const response = await apiRequest<CartResponse>('/api/cart/items', {
        method: 'POST',
        headers: getCartHeaders(),
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
          headers: getCartHeaders()
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
          headers: getCartHeaders(),
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
        headers: getCartHeaders()
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
          token,
          refreshToken,
          isAuthenticated: !!user,
          isAuthLoading,
          authError,
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
