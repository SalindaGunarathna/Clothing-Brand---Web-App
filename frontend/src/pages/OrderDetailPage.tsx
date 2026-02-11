import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../lib/store';
import { Badge } from '../components/ui/Badge';
import { calculateTax, calculateTotal, formatPrice } from '../lib/utils';
import { Order } from '../lib/types';
import { fetchOrderById } from '../lib/ordersApi';

export function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isAuthLoading, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?redirect=/my-orders', { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!id || !token || !isAuthenticated) return;
    const controller = new AbortController();
    const loadOrder = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchOrderById(id, token, controller.signal);
        setOrder(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Failed to load order';
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    loadOrder();
    return () => controller.abort();
  }, [id, token, isAuthenticated]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <p className="text-center text-text-secondary">Loading order...</p>
      </div>);

  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-text-secondary">
          {error || 'Order not found'}
        </p>
      </div>);

  }
  const tax = calculateTax(order.total);
  const total = calculateTotal(order.total);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <Link
        to="/my-orders"
        className="inline-flex items-center text-sm text-text-secondary hover:text-text mb-6">

        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Order #{order.id}</h1>
          <p className="text-text-secondary">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <Badge
          variant={order.status === 'DELIVERED' ? 'success' : 'accent'}
          size="md">

          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-border rounded-sm bg-white p-6">
            <h2 className="text-lg font-serif mb-4">Items</h2>
            <div className="space-y-6">
              {order.items.map((item, idx) =>
              <div
                key={idx}
                className="flex gap-4 border-b border-border last:border-0 pb-6 last:pb-0">

                  <div className="h-24 w-20 bg-surface-alt rounded-sm overflow-hidden shrink-0">
                    <img
                    src={item.imageUrl || ''}
                    alt=""
                    className="h-full w-full object-cover" />

                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium font-serif text-lg">
                        {item.name}
                      </h4>
                      <p className="font-medium">{formatPrice(item.price)}</p>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      Size: {item.size}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="border border-border rounded-sm bg-white p-6">
            <h2 className="text-lg font-serif mb-4">Shipping Address</h2>
            {order.shippingAddress ?
            <div className="text-sm text-text-secondary leading-relaxed space-y-1">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.zip}
                </p>
              </div> :
            <p className="text-sm text-text-secondary leading-relaxed">
                Shipping details unavailable.
              </p>
            }
          </div>

          <div className="border border-border rounded-sm bg-white p-6">
            <h2 className="text-lg font-serif mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
