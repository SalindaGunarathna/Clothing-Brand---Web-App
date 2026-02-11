import React, { useEffect } from 'react';
import { useToast } from '../../lib/store';
import { cn } from '../../lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
      {toasts.map((toast) =>
      <ToastItem
        key={toast.id}
        {...toast}
        onDismiss={() => removeToast(toast.id)} />

      )}
    </div>);

}
function ToastItem({
  id,
  message,
  type,
  onDismiss





}: {id: string;message: string;type: 'success' | 'error' | 'info';onDismiss: () => void;}) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-error" />,
    info: <Info className="h-5 w-5 text-accent" />
  };
  return (
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-md border border-border bg-white p-4 shadow-lg animate-slide-in-right">
      {icons[type]}
      <p className="text-sm font-medium text-text">{message}</p>
      <button
        onClick={onDismiss}
        className="ml-auto rounded-full p-1 text-text-secondary hover:bg-surface-alt hover:text-text">

        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-surface-alt">
        <div className="h-full bg-primary animate-[shrink_4s_linear_forwards]" />
      </div>
    </div>);

}