import React from 'react';
import { Button } from './Button';
import { BoxIcon } from 'lucide-react';
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 rounded-full bg-surface-alt p-4">
        <Icon className="h-8 w-8 text-text-secondary" />
      </div>
      <h3 className="mb-2 text-xl font-serif font-medium text-text">{title}</h3>
      <p className="mb-6 max-w-sm text-text-secondary">{description}</p>
      {action &&
      <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      }
    </div>);

}