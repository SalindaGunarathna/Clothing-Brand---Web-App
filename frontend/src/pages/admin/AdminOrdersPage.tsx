import React from 'react';
import { Card } from '../../components/ui/Card';

export function AdminOrdersPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-text mb-2">
          Orders
        </h1>
        <p className="text-text-secondary">
          Admin order management will be enabled after backend auth and admin
          integration.
        </p>
      </div>

      <Card className="p-6">
        <p className="text-sm text-text-secondary">
          Wire `GET /api/orders/admin/all` and `PATCH /api/orders/admin/:id/status`
          to manage orders here.
        </p>
      </Card>
    </div>);

}
