import React, { createContext, useContext, useState } from 'react';
import type { Toast, ToastType } from '../types';

export interface ToastContextType {
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

export function useToastState(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type
      }
    ]);
    setTimeout(() => removeToast(id), 4000);
  };

  return { toasts, addToast, removeToast };
}

export function ToastProvider({
  children,
  value
}: {
  children: React.ReactNode;
  value: ToastContextType;
}) {
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
