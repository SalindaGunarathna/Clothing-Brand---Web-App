import React from 'react';
import { Chip } from './Chip';
import { ProductSize } from '../../lib/types';
interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: string;
  onSelect: (size: string) => void;
  error?: string;
}
export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  error
}: SizeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) =>
        <Chip
          key={size}
          selected={selectedSize === size}
          onClick={() => onSelect(size)}
          className="min-w-[3rem]">

            {size}
          </Chip>
        )}
      </div>
      {error && <p className="text-xs text-error animate-pulse">{error}</p>}
    </div>);

}
