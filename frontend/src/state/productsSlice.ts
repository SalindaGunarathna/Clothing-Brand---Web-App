import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiGet } from '../lib/api';
import { Category, Product } from '../lib/types';
import type { RootState } from './store';

type ApiProduct = {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  createdAt?: string;
};

type ProductsResponse = {
  data: ApiProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

type ProductResponse = {
  data: ApiProduct;
};

type ProductsMeta = ProductsResponse['meta'];

const normalizeProduct = (product: ApiProduct): Product => ({
  id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  category: product.category as Category,
  sizes: product.sizes,
  createdAt: product.createdAt
});

const sortMap: Record<string, string> = {
  newest: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
  'name-asc': 'name',
  'name-desc': '-name'
};

export const fetchProducts = createAsyncThunk<
  { items: Product[]; meta: ProductsMeta },
  void,
  { state: RootState }
>('products/fetchProducts', async (_, { getState }) => {
  const { filters } = getState();
  const params = new URLSearchParams();

  if (filters.searchQuery) params.set('search', filters.searchQuery);
  if (filters.category) params.set('category', filters.category);
  if (filters.size) params.set('size', filters.size);
  if (filters.minPrice !== null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.sortBy) params.set('sort', sortMap[filters.sortBy]);
  params.set('page', String(filters.page));
  params.set('limit', String(filters.limit));

  const query = params.toString();
  const path = query ? `/api/products?${query}` : '/api/products';
  const response = await apiGet<ProductsResponse>(path);

  return {
    items: response.data.map(normalizeProduct),
    meta: response.meta
  };
});

export const fetchFeaturedProducts = createAsyncThunk<
  Product[],
  void
>('products/fetchFeaturedProducts', async () => {
  const response = await apiGet<ProductsResponse>(
    '/api/products?limit=3&sort=-createdAt'
  );
  return response.data.map(normalizeProduct);
});

export const fetchProductById = createAsyncThunk<Product, string>(
  'products/fetchProductById',
  async (id) => {
    const response = await apiGet<ProductResponse>(`/api/products/${id}`);
    return normalizeProduct(response.data);
  }
);

type ProductsState = {
  items: Product[];
  meta: ProductsMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  featured: Product[];
  featuredStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  featuredError: string | null;
  selected: Product | null;
  selectedStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  selectedError: string | null;
};

const initialState: ProductsState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  featured: [],
  featuredStatus: 'idle',
  featuredError: null,
  selected: null,
  selectedStatus: 'idle',
  selectedError: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.selectedStatus = 'idle';
      state.selectedError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load products';
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.featuredStatus = 'loading';
        state.featuredError = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredStatus = 'succeeded';
        state.featured = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.featuredStatus = 'failed';
        state.featuredError =
          action.error.message || 'Failed to load featured products';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selectedError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedStatus = 'failed';
        state.selectedError =
          action.error.message || 'Failed to load product';
      });
  }
});

export const { clearSelected } = productsSlice.actions;
export default productsSlice.reducer;
