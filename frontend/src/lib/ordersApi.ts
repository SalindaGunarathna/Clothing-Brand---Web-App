import { apiRequest } from './api';
import type { Order, OrderStatus, ProductSize, ShippingAddress } from './types';

type ApiOrderItem = {
  product: string;
  name: string;
  price: number;
  size: ProductSize | string;
  quantity: number;
  imageUrl?: string;
};

type ApiOrder = {
  _id: string;
  items: ApiOrderItem[];
  total: number;
  status: OrderStatus | string;
  orderDate: string;
  shippingAddress?: ShippingAddress;
};

type OrdersResponse = { data: ApiOrder[] };
type OrderResponse = { data: ApiOrder };
type CheckoutResponse = { data: { _id: string } };

const mapOrder = (order: ApiOrder): Order => ({
  id: order._id,
  items: order.items.map((item) => ({
    productId: item.product,
    name: item.name,
    price: item.price,
    size: item.size as ProductSize,
    quantity: item.quantity,
    imageUrl: item.imageUrl
  })),
  total: order.total,
  status: order.status as OrderStatus,
  orderDate: order.orderDate,
  shippingAddress: order.shippingAddress
});

export async function fetchMyOrders(
  token: string,
  signal?: AbortSignal
): Promise<Order[]> {
  const response = await apiRequest<OrdersResponse>('/api/orders', {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` },
    signal
  });
  return response.data.map(mapOrder);
}

export async function fetchOrderById(
  id: string,
  token: string,
  signal?: AbortSignal
): Promise<Order> {
  const response = await apiRequest<OrderResponse>(`/api/orders/${id}`, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` },
    signal
  });
  return mapOrder(response.data);
}

export async function checkoutOrder(
  token: string,
  payload: { shippingAddress: ShippingAddress; email?: string }
): Promise<string> {
  const response = await apiRequest<CheckoutResponse>('/api/orders/checkout', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return response.data._id;
}
