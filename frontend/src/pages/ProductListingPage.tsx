import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { cn, formatCategory, formatPrice } from '../lib/utils';
import { Category, FilterState, ProductSize } from '../lib/types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { fetchProducts } from '../state/productsSlice';
import {
  resetFilters,
  setCategory,
  setFiltersFromParams,
  setPage,
  setSize,
  setSortBy
} from '../state/filtersSlice';

const categories: { label: string; value: Category }[] = [
  { label: 'Women', value: 'WOMEN' },
  { label: 'Men', value: 'MEN' },
  { label: 'Kids', value: 'KIDS' }
];

const sizes: ProductSize[] = ['S', 'M', 'L', 'XL'];

const sortOptions: { label: string; value: FilterState['sortBy'] }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A to Z', value: 'name-asc' },
  { label: 'Name: Z to A', value: 'name-desc' }
];

const normalizeCategory = (value: string | null): Category | null => {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (upper === 'MEN' || upper === 'WOMEN' || upper === 'KIDS') {
    return upper as Category;
  }
  return null;
};

const normalizeSize = (value: string | null): ProductSize | null => {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (upper === 'S' || upper === 'M' || upper === 'L' || upper === 'XL') {
    return upper as ProductSize;
  }
  return null;
};

const normalizeSort = (
  value: string | null
): FilterState['sortBy'] | null => {
  if (!value) return null;
  const allowed = new Set(sortOptions.map((option) => option.value));
  return allowed.has(value as FilterState['sortBy'])
    ? (value as FilterState['sortBy'])
    : null;
};

export function ProductListingPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { items, status, error, meta } = useAppSelector(
    (state) => state.products
  );
  const filters = useAppSelector((state) => state.filters);

  useEffect(() => {
    const category = normalizeCategory(searchParams.get('category'));
    const size = normalizeSize(searchParams.get('size'));
    const search = searchParams.get('search') || '';
    const sort = normalizeSort(searchParams.get('sort'));
    const page = Number(searchParams.get('page')) || 1;

    dispatch(
      setFiltersFromParams({
        category,
        size,
        searchQuery: search,
        sortBy: sort || 'newest',
        page
      })
    );
  }, [dispatch, searchParams]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [
    dispatch,
    filters.category,
    filters.size,
    filters.searchQuery,
    filters.sortBy,
    filters.page,
    filters.limit,
    filters.minPrice,
    filters.maxPrice
  ]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next, { replace: true });
  };

  const activeTitle = useMemo(() => {
    if (filters.searchQuery) {
      return `Search: "${filters.searchQuery}"`;
    }
    if (filters.category) {
      return formatCategory(filters.category);
    }
    return 'All Products';
  }, [filters.category, filters.searchQuery]);

  const totalCount = meta?.total ?? items.length;

  const handleCategoryToggle = (value: Category) => {
    const next = filters.category === value ? null : value;
    dispatch(setCategory(next));
    updateParams({ category: next, page: '1' });
  };

  const handleSizeToggle = (value: ProductSize) => {
    const next = filters.size === value ? null : value;
    dispatch(setSize(next));
    updateParams({ size: next, page: '1' });
  };

  const handleSortChange = (value: FilterState['sortBy']) => {
    dispatch(setSortBy(value));
    updateParams({ sort: value, page: '1' });
  };

  const clearFilters = () => {
    dispatch(resetFilters());
    setSearchParams({}, { replace: true });
  };

  const goToPage = (page: number) => {
    dispatch(setPage(page));
    updateParams({ page: String(page) });
  };

  const hasFilters =
    Boolean(filters.category) ||
    Boolean(filters.size) ||
    Boolean(filters.searchQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2">{activeTitle}</h1>
          <p className="text-text-secondary text-sm">{totalCount} items</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center gap-2 text-sm font-medium border border-border rounded-sm px-4 py-2">

            <Filter className="h-4 w-4" /> Filters
          </button>

          <div className="relative group">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as FilterState['sortBy'])
              }
              className="appearance-none h-10 min-w-[200px] rounded-sm border border-border bg-white px-3 pr-9 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer">

              {sortOptions.map((option) =>
              <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-text-secondary" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 space-y-8 flex-shrink-0">
          {/* Categories */}
          <div>
            <h3 className="font-serif text-lg mb-4">Category</h3>
            <div className="space-y-2">
              {categories.map((cat) =>
              <label
                key={cat.value}
                className="flex items-center gap-2 cursor-pointer group">

                  <div
                  className={cn(
                    'w-4 h-4 border border-border rounded-sm flex items-center justify-center transition-colors',
                    filters.category === cat.value ?
                    'bg-primary border-primary' :
                    'group-hover:border-primary'
                  )}>

                    {filters.category === cat.value &&
                  <div className="w-2 h-2 bg-white rounded-[1px]" />
                  }
                  </div>
                  <input
                  type="checkbox"
                  className="hidden"
                  checked={filters.category === cat.value}
                  onChange={() => handleCategoryToggle(cat.value)} />

                  <span className="text-sm">{cat.label}</span>
                </label>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="font-serif text-lg mb-4">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) =>
              <Chip
                key={size}
                selected={filters.size === size}
                onClick={() => handleSizeToggle(size)}
                className="min-w-[2.5rem]">

                  {size}
                </Chip>
              )}
            </div>
          </div>

          {hasFilters ?
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={clearFilters}>

              Clear All Filters
            </Button> :
          null}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {(status === 'loading' || status === 'idle') &&
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {[0, 1, 2, 3, 4, 5].map((idx) =>
            <Skeleton key={idx} variant="productCard" />
            )}
            </div>
          }

          {status === 'failed' && error &&
          <EmptyState
            icon={Filter}
            title="Unable to load products"
            description={error}
            action={{
              label: 'Try Again',
              onClick: () => dispatch(fetchProducts())
            }} />
          }

          {status === 'succeeded' && items.length > 0 ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {items.map((product) =>
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group animate-fade-in">

                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface-alt mb-4">
                    <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-text-secondary">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
            )}
            </div> :

          status === 'succeeded' &&
          <EmptyState
            icon={Filter}
            title="No products found"
            description="Try adjusting your filters or search query to find what you're looking for."
            action={{
              label: 'Clear Filters',
              onClick: clearFilters
            }} />

          }

          {meta && meta.pages > 1 &&
          <div className="flex items-center justify-between mt-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(filters.page - 1)}
                disabled={filters.page <= 1}>

                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {filters.page} of {meta.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(filters.page + 1)}
                disabled={filters.page >= meta.pages}>

                Next
              </Button>
            </div>
          }
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen &&
      <div className="fixed inset-0 z-50 md:hidden">
          <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)} />

          <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl animate-slide-in-right p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Categories */}
              <div>
                <h3 className="font-medium mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) =>
                <label key={cat.value} className="flex items-center gap-2">
                      <input
                    type="checkbox"
                    checked={filters.category === cat.value}
                    onChange={() => handleCategoryToggle(cat.value)}
                    className="rounded-sm border-border text-primary focus:ring-accent" />

                      <span>{cat.label}</span>
                    </label>
                )}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="font-medium mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) =>
                <Chip
                  key={size}
                  selected={filters.size === size}
                  onClick={() => handleSizeToggle(size)}>

                      {size}
                    </Chip>
                )}
                </div>
              </div>

              {hasFilters &&
              <Button
                fullWidth
                variant="secondary"
                onClick={clearFilters}>

                  Clear Filters
                </Button>
              }

              <Button fullWidth onClick={() => setIsFilterOpen(false)}>
                View Results
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

}
