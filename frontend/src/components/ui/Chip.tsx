import React from 'react';
import { cn } from '../../lib/utils';
interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  disabled?: boolean;
}
export function Chip({
  className,
  selected,
  disabled,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-sm border px-3 py-1.5 text-sm font-medium transition-all duration-200',
        selected ?
        'border-primary bg-primary text-white' :
        'border-border bg-white text-text hover:border-primary',
        disabled &&
        'cursor-not-allowed opacity-40 bg-surface-alt hover:border-border decoration-slice line-through',
        className
      )}
      {...props}>

      {children}
    </button>);

}