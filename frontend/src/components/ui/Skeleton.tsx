import React from 'react';
import { cn } from '../../lib/utils';
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'image' | 'card' | 'productCard';
}
export function Skeleton({
  className,
  variant = 'text',
  ...props
}: SkeletonProps) {
  if (variant === 'productCard') {
    return (
      <div className="space-y-3">
        <div className="aspect-[3/4] w-full animate-pulse rounded-sm bg-surface-alt" />
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-alt" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-surface-alt" />
        </div>
      </div>);

  }
  return (
    <div
      className={cn(
        'animate-pulse rounded-sm bg-surface-alt',
        variant === 'text' && 'h-4 w-full',
        variant === 'image' && 'h-full w-full',
        variant === 'card' && 'h-64 w-full',
        className
      )}
      {...props} />);


}