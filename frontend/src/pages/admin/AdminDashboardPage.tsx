import React from 'react';
import { Card } from '../../components/ui/Card';

export function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-text mb-2">
          Dashboard
        </h1>
        <p className="text-text-secondary">
          Admin analytics will appear once authentication and admin features
          are wired to the backend.
        </p>
      </div>

      <Card className="p-6">
        <p className="text-sm text-text-secondary">
          Connect admin endpoints to unlock revenue, orders, and inventory
          insights.
        </p>
      </Card>
    </div>);

}
