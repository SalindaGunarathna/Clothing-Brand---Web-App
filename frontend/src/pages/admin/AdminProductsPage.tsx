import React from 'react';
import { Card } from '../../components/ui/Card';

export function AdminProductsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-text mb-2">
          Products
        </h1>
        <p className="text-text-secondary">
          Product management will be available after admin authentication is
          connected.
        </p>
      </div>

      <Card className="p-6">
        <p className="text-sm text-text-secondary">
          This page will connect to `POST /api/products` and admin product
          tooling once login is implemented.
        </p>
      </Card>
    </div>);

}
