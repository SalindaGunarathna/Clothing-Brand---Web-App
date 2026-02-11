import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose} />

      <div
        className={cn(
          'relative w-full transform rounded-lg bg-white shadow-xl transition-all animate-slide-up flex flex-col max-h-[90vh]',
          sizes[size]
        )}>

        <div className="flex items-center justify-between border-b border-border p-4 sm:p-6">
          {title &&
          <h3 className="text-lg font-serif font-medium text-text">
              {title}
            </h3>
          }
          <button
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:bg-surface-alt hover:text-text transition-colors">

            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>

        {footer &&
        <div className="border-t border-border p-4 sm:p-6 bg-surface/50 rounded-b-lg">
            {footer}
          </div>
        }
      </div>
    </div>);

}