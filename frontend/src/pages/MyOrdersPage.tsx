import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../lib/store';
import { Order } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { fetchMyOrders } from '../lib/ordersApi';
import { ShoppingBag } from 'lucide-react';

export function MyOrdersPage() {
  const { isAuthenticated, isAuthLoading, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?redirect=/my-orders', { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const controller = new AbortController();
    const loadOrders = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchMyOrders(token, controller.signal);
        setOrders(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Failed to load orders';
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    loadOrders();
    return () => controller.abort();
  }, [isAuthenticated, token]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <p className="text-center text-text-secondary">Loading orders...</p>
      </div>);

  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Unable to load orders"
          description={error}
          action={{
            label: 'Try Again',
            onClick: () => navigate(0)
          }} />

      </div>);

  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Place your first order to see it here."
          action={{
            label: 'Go Shopping',
            onClick: () => navigate('/shop')
          }} />

      </div>);

  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-serif mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) =>
        <div
          key={order.id}
          className="border border-border rounded-sm bg-white overflow-hidden">

            <div className="bg-surface-alt/50 p-4 flex flex-wrap gap-4 justify-between items-center border-b border-border">
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="block text-text-secondary text-xs uppercase tracking-wider">
                    Order Placed
                  </span>
                  <span className="font-medium">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-text-secondary text-xs uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-medium">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div>
                  <span className="block text-text-secondary text-xs uppercase tracking-wider">
                    Order #
                  </span>
                  <span className="font-medium">{order.id}</span>
                </div>
              </div>
              <Link to={`/my-orders/${order.id}`}>
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                  variant={
                  order.status === 'DELIVERED' ? 'success' : 'accent'
                  }>

                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) =>
              <div key={idx} className="flex gap-4">
                    <div className="h-20 w-16 bg-surface-alt rounded-sm overflow-hidden shrink-0">
                      <img
                    src={item.imageUrl || ''}
                    alt=""
                    className="h-full w-full object-cover" />

                    </div>
                    <div>
                      <h4 className="font-medium font-serif">{item.name}</h4>
                      <p className="text-sm text-text-secondary">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

}
