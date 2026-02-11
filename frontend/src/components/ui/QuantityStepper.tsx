import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        'flex items-center border border-border rounded-sm w-fit',
        className
      )}>

      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="p-2 text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed">

        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="p-2 text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed">

        <Plus className="h-4 w-4" />
      </button>
    </div>);

}