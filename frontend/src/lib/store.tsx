import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode
} from 'react';
import {
  CartItem,
  Product,
  ProductSize,
  User,
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
  addToCart: (product: Product, size: ProductSize, quantity: number) => void;
  removeFromCart: (productId: string, size: ProductSize) => void;
  updateQuantity: (
    productId: string,
    size: ProductSize,
    quantity: number
  ) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
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
  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('maison-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);
  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem('maison-cart', JSON.stringify(items));
  }, [items]);
  const addToCart = (
    product: Product,
    size: ProductSize,
    quantity: number
  ) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.selectedSize === size
      );
      if (existing) {
        addToast(`Updated quantity for ${product.name}`, 'success');
        return prev.map((item) =>
        item.productId === product.id && item.selectedSize === size ?
        {
          ...item,
          quantity: item.quantity + quantity
        } :
        item
        );
      }
      addToast(`Added ${product.name} to cart`, 'success');
      return [
      ...prev,
      {
        productId: product.id,
        product,
        selectedSize: size,
        quantity
      }];

    });
  };
  const removeFromCart = (productId: string, size: ProductSize) => {
    setItems((prev) =>
    prev.filter(
      (item) => !(item.productId === productId && item.selectedSize === size)
    )
    );
    addToast('Item removed from cart', 'info');
  };
  const updateQuantity = (
  productId: string,
  size: ProductSize,
  quantity: number) =>
  {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setItems((prev) =>
    prev.map((item) =>
    item.productId === productId && item.selectedSize === size ?
    {
      ...item,
      quantity
    } :
    item
    )
    );
  };
  const clearCart = () => {
    setItems([]);
  };
  const cartTotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
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
            cartCount
          }}>

          {children}
        </CartContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>);

}
