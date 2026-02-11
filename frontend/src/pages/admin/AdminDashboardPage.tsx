import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowUpRight, Boxes, Clock3, PackageCheck, ShoppingBag } from 'lucide-react';
import {
  fetchAdminOrderCount,
  fetchAdminOrders,
  fetchProductCount
} from '../../lib/adminApi';
import { useAuth, useToast } from '../../lib/store';
import { formatPrice, formatStatus, getOrderStatusVariant } from '../../lib/utils';

export function AdminDashboardPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState<
    Awaited<ReturnType<typeof fetchAdminOrders>>['orders']
  >([]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [
          ordersResponse,
          placedCount,
          processingCount,
          deliveredCount,
          productCount
        ] = await Promise.all([
          fetchAdminOrders(token, { page: 1, limit: 5 }, controller.signal),
          fetchAdminOrderCount(token, 'PLACED', controller.signal),
          fetchAdminOrderCount(token, 'PROCESSING', controller.signal),
          fetchAdminOrderCount(token, 'DELIVERED', controller.signal),
          fetchProductCount(token, controller.signal)
        ]);

        setRecentOrders(ordersResponse.orders);
        setTotalOrders(ordersResponse.meta.total);
        setPendingOrders(placedCount + processingCount);
        setDeliveredOrders(deliveredCount);
        setTotalProducts(productCount);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(message);
        addToast(message, 'error');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    loadDashboard();
    return () => controller.abort();
  }, [token, addToast]);

  const statCards = useMemo(() => {
    return [
      {
        label: 'Total Orders',
        value: totalOrders.toLocaleString(),
        hint: 'All-time confirmed orders',
        icon: ShoppingBag
      },
      {
        label: 'Pending Orders',
        value: pendingOrders.toLocaleString(),
        hint: 'Placed + Processing',
        icon: Clock3
      },
      {
        label: 'Delivered Orders',
        value: deliveredOrders.toLocaleString(),
        hint: 'Successfully delivered',
        icon: PackageCheck
      },
      {
        label: 'Total Products',
        value: totalProducts.toLocaleString(),
        hint: 'Active and inactive catalog items',
        icon: Boxes
      }
    ];
  }, [totalOrders, pendingOrders, deliveredOrders, totalProducts]);

  const recentTotal = useMemo(
    () => recentOrders.reduce((sum, order) => sum + order.total, 0),
    [recentOrders]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-text mb-2">
          Dashboard
        </h1>
        <p className="text-text-secondary">
          Monitor the latest activity and key totals.
        </p>
      </div>

      {error &&
      <Card className="p-6">
          <p className="text-sm text-error">{error}</p>
        </Card>
      }

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) =>
        <Card key={card.label} className="p-0 overflow-hidden bg-gradient-to-br from-white to-surface-alt/50">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <p className="text-xs text-text-secondary uppercase tracking-wide">
              {card.label}
                </p>
                <div className="h-11 w-11 rounded-full bg-surface-alt flex items-center justify-center text-text">
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-serif leading-none">
                {isLoading ? '—' : card.value}
              </p>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <ArrowUpRight className="h-4 w-4 text-success" />
                <span>{card.hint}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif">Recent Orders</h2>
              <p className="text-sm text-text-secondary">
                Showing the latest 5 orders.
              </p>
            </div>
            <Link to="/admin/orders">
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {isLoading &&
          <p className="text-sm text-text-secondary">Loading orders...</p>
          }

          {!isLoading && recentOrders.length === 0 &&
          <p className="text-sm text-text-secondary">No orders yet.</p>
          }

          {!isLoading && recentOrders.length > 0 &&
          <div className="space-y-3">
              {recentOrders.map((order) =>
            <div
                key={order.id}
                className="flex items-center justify-between border border-border rounded-sm px-4 py-3">

                  <div>
                    <p className="text-sm font-medium">#{order.id}</p>
                    <p className="text-xs text-text-secondary">
                      {order.user?.name || 'Unknown'} •{' '}
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">
                      {formatPrice(order.total)}
                    </p>
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                </div>
            )}
            </div>
          }
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-serif mb-4">Recent Revenue</h2>
          <p className="text-sm text-text-secondary">
            Based on the last {recentOrders.length} orders.
          </p>
          <p className="text-3xl font-serif mt-4">
            {isLoading ? '—' : formatPrice(recentTotal)}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            Add a revenue endpoint for full-period totals.
          </p>
        </Card>
      </div>
    </div>);

}
