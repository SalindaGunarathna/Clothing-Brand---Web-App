import React from 'react';
import { cn } from '../../lib/utils';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
export function Card({
  className,
  hover = false,
  padding = 'md',
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  return (
    <div
      className={cn(
        'rounded-sm bg-white border border-border shadow-sm',
        hover &&
        'transition-all duration-300 hover:shadow-md hover:-translate-y-1',
        paddings[padding],
        className
      )}
      {...props} />);


}