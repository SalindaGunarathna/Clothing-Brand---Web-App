import { apiRequest } from './api';
import type {
  Category,
  OrderStatus,
  ProductSize,
  ShippingAddress,
  UserRole
} from './types';

type ApiAdminOrderItem = {
  product: string;
  name: string;
  price: number;
  size: ProductSize | string;
  quantity: number;
  imageUrl?: string;
};

type ApiAdminOrderUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
};

type ApiAdminOrder = {
  _id: string;
  user?: ApiAdminOrderUser;
  items: ApiAdminOrderItem[];
  total: number;
  status: OrderStatus | string;
  orderDate: string;
  shippingAddress?: ShippingAddress;
};

type AdminOrdersResponse = {
  data: ApiAdminOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type AdminOrder = {
  id: string;
  user?: ApiAdminOrderUser;
  items: ApiAdminOrderItem[];
  total: number;
  status: OrderStatus;
  orderDate: string;
  shippingAddress?: ShippingAddress;
};

const mapAdminOrder = (order: ApiAdminOrder): AdminOrder => ({
  id: order._id,
  user: order.user
    ? {
      ...order.user,
      id: order.user.id || order.user._id
    }
    : undefined,
  items: order.items,
  total: order.total,
  status: order.status as OrderStatus,
  orderDate: order.orderDate,
  shippingAddress: order.shippingAddress
});

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

export async function fetchAdminOrders(
  token: string,
  params: {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  signal?: AbortSignal
): Promise<{ orders: AdminOrder[]; meta: AdminOrdersResponse['meta'] }> {
  const query = buildQuery(params);
  const response = await apiRequest<AdminOrdersResponse>(
    `/api/orders/admin/all${query}`,
    {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      signal
    }
  );
  return {
    orders: response.data.map(mapAdminOrder),
    meta: response.meta
  };
}

export async function fetchAdminOrderCount(
  token: string,
  status?: OrderStatus,
  signal?: AbortSignal
): Promise<number> {
  const query = buildQuery({
    status,
    limit: 1,
    page: 1
  });
  const response = await apiRequest<AdminOrdersResponse>(
    `/api/orders/admin/all${query}`,
    {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      signal
    }
  );
  return response.meta.total;
}

export async function updateAdminOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus
): Promise<AdminOrder> {
  const response = await apiRequest<{ data: ApiAdminOrder }>(
    `/api/orders/admin/${orderId}/status`,
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    }
  );
  return mapAdminOrder(response.data);
}

type ApiAdminProduct = {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category | string;
  sizes: Array<ProductSize | string>;
  stockBySize?: Record<string, number> | Map<string, number>;
  isActive: boolean;
  createdAt?: string;
};

type AdminProductsResponse = {
  data: ApiAdminProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export async function fetchProductCount(
  token: string,
  signal?: AbortSignal
): Promise<number> {
  const response = await apiRequest<AdminProductsResponse>(
    '/api/products/admin/all?limit=1&page=1',
    {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      signal
    }
  );
  return response.meta.total;
}

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
  sizes: ProductSize[];
  stockBySize: Record<string, number>;
  isActive: boolean;
  createdAt?: string;
};

const toPlainObject = (
  value?: Record<string, number> | Map<string, number>
): Record<string, number> => {
  if (!value) return {};
  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  }
  return value;
};

const mapAdminProduct = (product: ApiAdminProduct): AdminProduct => ({
  id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  category: product.category as Category,
  sizes: product.sizes.map((size) => String(size).toUpperCase()) as ProductSize[],
  stockBySize: toPlainObject(product.stockBySize),
  isActive: Boolean(product.isActive),
  createdAt: product.createdAt
});

export async function fetchAdminProducts(
  token: string,
  params: {
    search?: string;
    category?: Category;
    size?: ProductSize;
    minPrice?: number;
    maxPrice?: number;
    status?: 'all' | 'active' | 'inactive';
    sort?: 'name' | '-name' | 'price' | '-price' | 'createdAt' | '-createdAt';
    page?: number;
    limit?: number;
  },
  signal?: AbortSignal
): Promise<{ products: AdminProduct[]; meta: AdminProductsResponse['meta'] }> {
  const query = buildQuery({
    search: params.search,
    category: params.category,
    size: params.size,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    status: params.status,
    sort: params.sort,
    page: params.page,
    limit: params.limit
  });

  const response = await apiRequest<AdminProductsResponse>(
    `/api/products/admin/all${query}`,
    {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      signal
    }
  );

  return {
    products: response.data.map(mapAdminProduct),
    meta: response.meta
  };
}

type AdminProductResponse = {
  data: ApiAdminProduct;
};

export async function fetchAdminProductById(
  token: string,
  productId: string,
  signal?: AbortSignal
): Promise<AdminProduct> {
  const response = await apiRequest<AdminProductResponse>(
    `/api/products/admin/${productId}`,
    {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      signal
    }
  );

  return mapAdminProduct(response.data);
}

export type ProductCreatePayload = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
  sizes: ProductSize[];
  stockBySize?: Record<string, number>;
};

export type ProductUpdatePayload = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
  sizes: ProductSize[];
  stockBySize?: Record<string, number>;
  isActive: boolean;
};

export async function createProduct(
  token: string,
  payload: ProductCreatePayload
): Promise<AdminProduct> {
  const response = await apiRequest<{ data: ApiAdminProduct }>('/api/products', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return mapAdminProduct(response.data);
}

export async function updateAdminProduct(
  token: string,
  productId: string,
  payload: ProductUpdatePayload
): Promise<AdminProduct> {
  const response = await apiRequest<{ data: ApiAdminProduct }>(
    `/api/products/admin/${productId}`,
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }
  );
  return mapAdminProduct(response.data);
}
