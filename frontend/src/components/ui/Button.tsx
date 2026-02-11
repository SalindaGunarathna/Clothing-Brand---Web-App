import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
  {
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    children,
    disabled,
    ...props
  },
  ref) =>
  {
    const baseStyles =
    'inline-flex items-center justify-center rounded-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-light shadow-sm',
      secondary:
      'border border-primary bg-transparent text-primary hover:bg-surface-alt',
      accent: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
      ghost: 'hover:bg-surface-alt text-text-secondary hover:text-text',
      danger: 'bg-error text-white hover:bg-red-700'
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-6 text-sm',
      lg: 'h-12 px-8 text-base'
    };
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}>

        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>);

  }
);
Button.displayName = 'Button';