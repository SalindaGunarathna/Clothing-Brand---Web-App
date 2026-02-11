import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, FilterState, ProductSize } from '../lib/types';

const initialState: FilterState = {
  category: null,
  size: null,
  minPrice: null,
  maxPrice: null,
  sortBy: 'newest',
  searchQuery: '',
  page: 1,
  limit: 12
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<Category | null>) {
      state.category = action.payload;
      state.page = 1;
    },
    setSize(state, action: PayloadAction<ProductSize | null>) {
      state.size = action.payload;
      state.page = 1;
    },
    setPriceRange(
      state,
      action: PayloadAction<{ minPrice: number | null; maxPrice: number | null }>
    ) {
      state.minPrice = action.payload.minPrice;
      state.maxPrice = action.payload.maxPrice;
      state.page = 1;
    },
    setSortBy(state, action: PayloadAction<FilterState['sortBy']>) {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setFiltersFromParams(state, action: PayloadAction<Partial<FilterState>>) {
      const next = action.payload;
      if ('category' in next) state.category = next.category ?? null;
      if ('size' in next) state.size = next.size ?? null;
      if ('minPrice' in next) state.minPrice = next.minPrice ?? null;
      if ('maxPrice' in next) state.maxPrice = next.maxPrice ?? null;
      if ('sortBy' in next && next.sortBy) state.sortBy = next.sortBy;
      if ('searchQuery' in next && next.searchQuery !== undefined) {
        state.searchQuery = next.searchQuery;
      }
      if ('page' in next && next.page) state.page = next.page;
      if ('limit' in next && next.limit) state.limit = next.limit;
    },
    resetFilters() {
      return initialState;
    }
  }
});

export const {
  setCategory,
  setSize,
  setPriceRange,
  setSortBy,
  setSearchQuery,
  setPage,
  setFiltersFromParams,
  resetFilters
} = filtersSlice.actions;

export default filtersSlice.reducer;
