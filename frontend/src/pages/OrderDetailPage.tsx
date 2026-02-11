import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function OrderDetailPage() {
  const { id } = useParams();
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <Link
        to="/my-orders"
        className="inline-flex items-center text-sm text-text-secondary hover:text-text mb-6">

        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>

      <div className="border border-border rounded-sm bg-white p-6">
        <h1 className="text-2xl font-serif mb-2">Order #{id}</h1>
        <p className="text-text-secondary">
          Order details will be available after login and order integration.
        </p>
      </div>
    </div>);

}
