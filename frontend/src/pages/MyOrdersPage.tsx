import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

export function MyOrdersPage() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <EmptyState
        icon={ShoppingBag}
        title="Orders require login"
        description="Please sign in to view your order history."
        action={{
          label: 'Go to Login',
          onClick: () => navigate('/login?redirect=/my-orders')
        }} />

    </div>);

}
