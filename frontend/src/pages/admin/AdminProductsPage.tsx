import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, PackageSearch, Plus, Search, Trash2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/Table';
import {
  createProduct,
  deleteAdminProduct,
  fetchAdminProducts
} from '../../lib/adminApi';
import { useAuth, useToast } from '../../lib/store';
import { formatCategory, formatPrice } from '../../lib/utils';
import type { Category, ProductSize } from '../../lib/types';

type ProductFilters = {
  search: string;
  category: Category | '';
  size: ProductSize | '';
  status: 'all' | 'active' | 'inactive';
  minPrice: string;
  maxPrice: string;
  sort: 'name' | '-name' | 'price' | '-price' | 'createdAt' | '-createdAt';
  page: number;
  limit: 10 | 15;
};

const categoryOptions: Array<{ label: string; value: Category }> = [
  { label: 'Women', value: 'WOMEN' },
  { label: 'Men', value: 'MEN' },
  { label: 'Kids', value: 'KIDS' }
];

const sizeOptions: ProductSize[] = ['S', 'M', 'L', 'XL'];

const sortOptions: Array<{
  label: string;
  value: ProductFilters['sort'];
}> = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Oldest', value: 'createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Name: A to Z', value: 'name' },
  { label: 'Name: Z to A', value: '-name' }
];

const toNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const getTotalStock = (stockBySize: Record<string, number>) =>
  Object.values(stockBySize || {}).reduce((sum, value) => sum + Number(value || 0), 0);

const getStockBadge = (
  isActive: boolean,
  stockBySize: Record<string, number>
) => {
  if (!isActive) {
    return { label: 'Inactive', variant: 'error' as const };
  }
  const stock = getTotalStock(stockBySize);
  if (stock > 0) {
    return { label: 'In Stock', variant: 'success' as const };
  }
  return { label: 'Out of Stock', variant: 'accent' as const };
};

export function AdminProductsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof fetchAdminProducts>>['products']
  >([]);
  const [meta, setMeta] = useState<
    Awaited<ReturnType<typeof fetchAdminProducts>>['meta'] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    size: '',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1,
    limit: 10
  });
  const [searchInput, setSearchInput] = useState('');

  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'WOMEN' as Category
  });
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [stockBySize, setStockBySize] = useState<Record<string, string>>({});

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      category: filters.category || undefined,
      size: filters.size || undefined,
      status: filters.status,
      minPrice: toNumber(filters.minPrice),
      maxPrice: toNumber(filters.maxPrice),
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit
    }),
    [filters]
  );

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    const loadProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetchAdminProducts(
          token,
          queryParams,
          controller.signal
        );
        setProducts(response.products);
        setMeta(response.meta);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Failed to load products';
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();
    return () => controller.abort();
  }, [token, queryParams, refreshKey]);

  const handleFilterChange = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value as number : 1
    }));
  };

  const resetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      category: '',
      size: '',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      page: 1,
      limit: 10
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', searchInput.trim());
  };

  const handleToggleSize = (size: ProductSize) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((value) => value !== size) : [...prev, size]
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetCreateForm = () => {
    setFormError('');
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: 'WOMEN'
    });
    setSizes([]);
    setStockBySize({});
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!token) {
      setFormError('Admin authentication required.');
      return;
    }

    if (!formData.name.trim() || !formData.description.trim()) {
      setFormError('Name and description are required.');
      return;
    }

    const priceValue = Number(formData.price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setFormError('Enter a valid price.');
      return;
    }

    if (!formData.imageUrl.trim()) {
      setFormError('Image URL is required.');
      return;
    }

    if (sizes.length === 0) {
      setFormError('Select at least one size.');
      return;
    }

    const cleanedStock: Record<string, number> = {};
    Object.entries(stockBySize).forEach(([size, value]) => {
      if (!sizes.includes(size as ProductSize)) return;
      const qty = Number(value);
      if (Number.isFinite(qty) && qty >= 0) {
        cleanedStock[size] = qty;
      }
    });

    setCreateLoading(true);
    try {
      await createProduct(token, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceValue,
        imageUrl: formData.imageUrl.trim(),
        category: formData.category,
        sizes,
        stockBySize: Object.keys(cleanedStock).length ? cleanedStock : undefined
      });
      addToast('Product created successfully', 'success');
      setIsCreateModalOpen(false);
      resetCreateForm();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create product';
      setFormError(message);
      addToast(message, 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!token) {
      addToast('Admin authentication required.', 'error');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this product? This action cannot be undone.'
    );
    if (!confirmed) return;

    setDeleteId(productId);
    try {
      await deleteAdminProduct(token, productId);
      addToast('Product deleted successfully', 'success');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete product';
      addToast(message, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-text mb-2">
          Products
        </h1>
        <p className="text-text-secondary">
          Manage catalog items with search, filters, and pagination.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">

          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full h-10 pl-12 pr-3 border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={resetFilters}>
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 md:ml-auto">
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </form>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <select
            className="h-10 px-3 border border-border rounded-sm text-sm"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value as Category | '')}>
            <option value="">All Categories</option>
            {categoryOptions.map((option) =>
            <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )}
          </select>

          <select
            className="h-10 px-3 border border-border rounded-sm text-sm"
            value={filters.size}
            onChange={(e) => handleFilterChange('size', e.target.value as ProductSize | '')}>
            <option value="">All Sizes</option>
            {sizeOptions.map((size) =>
            <option key={size} value={size}>
                {size}
              </option>
            )}
          </select>

          <select
            className="h-10 px-3 border border-border rounded-sm text-sm"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value as ProductFilters['status'])}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="h-10 px-3 border border-border rounded-sm text-sm"
          />

          <input
            type="number"
            min="0"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="h-10 px-3 border border-border rounded-sm text-sm"
          />

          <select
            className="h-10 px-3 border border-border rounded-sm text-sm"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value as ProductFilters['sort'])}>
            {sortOptions.map((option) =>
            <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )}
          </select>
        </div>
      </Card>

      {error &&
      <Card className="p-4">
          <p className="text-sm text-error">{error}</p>
        </Card>
      }

      {isLoading &&
      <Card className="p-6">
          <p className="text-sm text-text-secondary">Loading products...</p>
        </Card>
      }

      {!isLoading && products.length === 0 &&
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        description="Try a different filter or search term."
      />
      }

      {!isLoading && products.length > 0 &&
      <Card className="p-0 overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24">Price</TableHead>
                <TableHead className="w-20">Stock</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stock = getTotalStock(product.stockBySize);
                const badge = getStockBadge(product.isActive, product.stockBySize);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="w-24">
                      <div className="h-14 w-14 min-h-14 min-w-14 rounded-sm overflow-hidden bg-surface-alt">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="h-14 w-14 object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-text-secondary line-clamp-1">
                        {product.description}
                      </p>
                    </TableCell>
                    <TableCell>{formatCategory(product.category)}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="h-8 w-8 rounded-sm border border-border inline-flex items-center justify-center hover:bg-surface-alt">
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={deleteId === product.id}
                          title="Delete product"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8 w-8 rounded-sm border border-border inline-flex items-center justify-center text-text-secondary hover:text-error hover:border-error disabled:opacity-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      }

      {meta && meta.pages > 1 &&
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Rows per page</span>
            <select
              className="h-9 px-2 border border-border rounded-sm text-sm"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', Number(e.target.value) as 10 | 15)}>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <div className="text-sm text-text-secondary">
            Page {meta.page} of {meta.pages} ({meta.total} products)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange('page', Math.max(filters.page - 1, 1))}
              disabled={filters.page <= 1}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange('page', Math.min(filters.page + 1, meta.pages))}
              disabled={filters.page >= meta.pages}>
              Next
            </Button>
          </div>
        </div>
      }

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        title="Add Product"
        size="xl">

        <form onSubmit={handleCreateProduct} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="name"
              label="Product Name"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
            <Input
              name="imageUrl"
              label="Image URL"
              required
              value={formData.imageUrl}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="price"
              label="Price"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.price}
              onChange={handleInputChange}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">Category</label>
              <select
                className="h-10 px-3 border border-border rounded-sm text-sm w-full"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as Category
                  }))
                }>
                {categoryOptions.map((option) =>
                <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-sm border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) =>
              <button
                type="button"
                key={size}
                onClick={() => handleToggleSize(size)}
                className={`px-3 py-2 text-sm rounded-sm border ${
                  sizes.includes(size)
                    ? 'bg-primary text-white border-primary'
                    : 'border-border'
                }`}>
                  {size}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Stock by Size (optional)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sizeOptions.map((size) =>
              <div key={size} className="space-y-1">
                  <label className="text-xs text-text-secondary">{size}</label>
                  <input
                    type="number"
                    min="0"
                    disabled={!sizes.includes(size)}
                    value={stockBySize[size] || ''}
                    onChange={(e) =>
                      setStockBySize((prev) => ({
                        ...prev,
                        [size]: e.target.value
                      }))
                    }
                    className="w-full rounded-sm border border-border px-2 py-1 text-sm disabled:bg-surface-alt disabled:text-text-secondary"
                  />
                </div>
              )}
            </div>
          </div>

          {formError &&
          <p className="text-sm text-error">{formError}</p>
          }

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createLoading}>
              Add Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>);
}
