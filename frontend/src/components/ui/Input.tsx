import React, { useState, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    return (
      <div className="w-full space-y-1.5">
        {label &&
        <label className="text-sm font-medium text-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        }
        <div className="relative">
          <input
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'flex h-10 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm ring-offset-surface file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              error && 'border-error focus-visible:ring-error',
              className
            )}
            ref={ref}
            {...props} />

          {isPassword &&
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text">

              {showPassword ?
            <EyeOff className="h-4 w-4" /> :

            <Eye className="h-4 w-4" />
            }
            </button>
          }
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        {helperText && !error &&
        <p className="text-xs text-text-secondary">{helperText}</p>
        }
      </div>);

  }
);
Input.displayName = 'Input';