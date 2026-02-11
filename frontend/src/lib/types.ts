export type Category = 'MEN' | 'WOMEN' | 'KIDS';
export type ProductSize = 'S' | 'M' | 'L' | 'XL';
export type UserRole = 'USER' | 'ADMIN';
export type OrderStatus =
  | 'PLACED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';
export type ToastType = 'success' | 'error' | 'info';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: Category;
  imageUrl: string;
  sizes: ProductSize[];
  createdAt?: string;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: Category;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  size: ProductSize;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: ProductSize;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  shippingAddress?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface FilterState {
  category: Category | null;
  size: ProductSize | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy:
    | 'newest'
    | 'price-asc'
    | 'price-desc'
    | 'name-asc'
    | 'name-desc';
  searchQuery: string;
  page: number;
  limit: number;
}
