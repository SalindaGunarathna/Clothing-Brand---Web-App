import React, { cloneElement } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../lib/utils';
interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}
export function StarRating({
  rating,
  count,
  size = 'sm',
  className
}: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="fill-current text-accent" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarHalf key={i} className="fill-current text-accent" />);
    } else {
      stars.push(<Star key={i} className="text-border" />);
    }
  }
  const sizeClasses = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {stars.map((star, i) =>
        cloneElement(star, {
          key: i,
          className: cn(star.props.className, sizeClasses)
        })
        )}
      </div>
      {count !== undefined &&
      <span
        className={cn(
          'text-text-secondary ml-1',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>

          ({count})
        </span>
      }
    </div>);

}