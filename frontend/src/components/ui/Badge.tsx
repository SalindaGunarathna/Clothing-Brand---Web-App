import React from 'react';
import { cn } from '../../lib/utils';
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'sage' | 'error' | 'success';
  size?: 'sm' | 'md';
}
export function Badge({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-primary text-white',
    accent: 'bg-accent text-white',
    sage: 'bg-sage text-white',
    error: 'bg-error text-white',
    success: 'bg-success text-white'
  };
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs'
  };
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props} />);


}