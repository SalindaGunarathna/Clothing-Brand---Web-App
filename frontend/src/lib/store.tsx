import React from 'react';
import {
  ToastProvider,
  useToast,
  useToastState
} from './contexts/toast';
import {
  AuthProvider,
  useAuth,
  useAuthState
} from './contexts/auth';
import {
  CartProvider,
  useCart,
  useCartState
} from './contexts/cart';

export { useToast, useAuth, useCart };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const toastState = useToastState();
  const authState = useAuthState(toastState.addToast);
  const cartState = useCartState(toastState.addToast, authState.token);

  const logout = async () => {
    await authState.logout();
    await cartState.loadCart(cartState.guestId);
  };

  return (
    <ToastProvider value={toastState}>
      <AuthProvider value={{ ...authState, logout }}>
        <CartProvider value={cartState.contextValue}>{children}</CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
