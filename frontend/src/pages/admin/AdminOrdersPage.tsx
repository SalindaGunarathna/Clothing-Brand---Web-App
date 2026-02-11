import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useAuth, useToast } from '../../lib/store';
import {
  fetchAdminOrders,
  updateAdminOrderStatus
} from '../../lib/adminApi';
import { formatPrice, formatStatus, getOrderStatusVariant } from '../../lib/utils';
import type { OrderStatus } from '../../lib/types';
import { ClipboardList } from 'lucide-react';

export function AdminOrdersPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<
    Awaited<ReturnType<typeof fetchAdminOrders>>['orders']
  >([]);
  const [meta, setMeta] = useState<{ page: number; pages: number; total: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const statusOptions: Array<{ label: string; value: OrderStatus }> = [
    { label: 'Placed', value: 'PLACED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  const queryParams = useMemo(
    () => ({
      status: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      limit: 10
    }),
    [statusFilter, startDate, endDate, page]
  );

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const loadOrders = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetchAdminOrders(token, queryParams, controller.signal);
        setOrders(response.orders);
        setMeta({ page: response.meta.page, pages: response.meta.pages, total: response.meta.total });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Failed to load orders';
        setError(message);
        addToast(message, 'error');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    loadOrders();
    return () => controller.abort();
  }, [token, queryParams, addToast]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      const updated = await updateAdminOrderStatus(token, orderId, status);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      );
      addToast('Order status updated', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update status';
      addToast(message, 'error');
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-text mb-2">
          Orders
        </h1>
        <p className="text-text-secondary">
          Review and update customer orders.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              Status
            </label>
            <select
              className="border border-border rounded-sm px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | '');
                setPage(1);
              }}>
              <option value="">All</option>
              {statusOptions.map((option) =>
              <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              className="border border-border rounded-sm px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-wide">
              End Date
            </label>
            <input
              type="date"
              className="border border-border rounded-sm px-3 py-2 text-sm"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </Card>

      {error &&
      <Card className="p-6">
          <p className="text-sm text-error">{error}</p>
        </Card>
      }

      {isLoading &&
      <Card className="p-6">
          <p className="text-sm text-text-secondary">Loading orders...</p>
        </Card>
      }

      {!isLoading && orders.length === 0 &&
      <EmptyState
        icon={ClipboardList}
        title="No orders found"
        description="Try adjusting your filters."
      />
      }

      {!isLoading && orders.length > 0 &&
      <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) =>
            <TableRow key={order.id}>
                  <TableCell>
                    <p className="text-sm font-medium">#{order.id}</p>
                    <p className="text-xs text-text-secondary">
                      {order.items.length} items
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">
                      {order.user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {order.user?.email || '—'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <select
                      className="border border-border rounded-sm px-2 py-1 text-xs"
                      value={order.status}
                      onChange={(e) =>
                        e.target.value !== order.status &&
                        handleStatusUpdate(
                          order.id,
                          e.target.value as OrderStatus
                        )
                      }
                      disabled={updating[order.id]}>
                      {statusOptions.map((option) =>
                    <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      )}
                    </select>
                  </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </Card>
      }

      {meta && meta.pages > 1 &&
      <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {meta.page} of {meta.pages} ({meta.total} orders)
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, meta.pages))}
            disabled={page >= meta.pages}>
            Next
          </Button>
        </div>
      }
    </div>);

}
