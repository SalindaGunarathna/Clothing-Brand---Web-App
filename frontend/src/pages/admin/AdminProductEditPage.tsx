import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProductDetailLayout } from '../../components/product/ProductDetailLayout';
import { fetchAdminProductById, updateAdminProduct } from '../../lib/adminApi';
import { useAuth, useToast } from '../../lib/store';
import type { Category, ProductSize } from '../../lib/types';

const categoryOptions: Array<{ label: string; value: Category }> = [
  { label: 'Women', value: 'WOMEN' },
  { label: 'Men', value: 'MEN' },
  { label: 'Kids', value: 'KIDS' }
];

const sizeOptions: ProductSize[] = ['S', 'M', 'L', 'XL'];

export function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
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
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError('');

    fetchAdminProductById(token, id, controller.signal)
      .then((product) => {
        setFormData({
          name: product.name,
          description: product.description,
          price: String(product.price),
          imageUrl: product.imageUrl,
          category: product.category
        });
        setSizes(product.sizes);
        setIsActive(product.isActive);
        const stock: Record<string, string> = {};
        Object.entries(product.stockBySize || {}).forEach(([size, qty]) => {
          stock[size] = String(qty);
        });
        setStockBySize(stock);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Failed to load product';
        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [token, id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleToggleSize = (size: ProductSize) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((value) => value !== size)
        : [...prev, size]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!id) {
      setFormError('Invalid product identifier.');
      return;
    }

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

    setIsSaving(true);
    try {
      await updateAdminProduct(token, id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceValue,
        imageUrl: formData.imageUrl.trim(),
        category: formData.category,
        sizes,
        stockBySize: cleanedStock,
        isActive
      });
      addToast('Product updated successfully', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update product';
      setFormError(message);
      addToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <Skeleton variant="card" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="p-4">
          <p className="text-sm text-error">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/admin/products')}
        >
          Cancel
        </Button>
      </div>

      <ProductDetailLayout
        imageUrl={formData.imageUrl}
        imageAlt={formData.name || 'Product image'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="mb-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Edit Product
            </span>
            <h1 className="text-3xl font-serif">{formData.name || 'Product'}</h1>
          </div>

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
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">Status</label>
              <select
                className="h-10 px-3 border border-border rounded-sm text-sm w-full"
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              {sizeOptions.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => handleToggleSize(size)}
                  className={`px-3 py-2 text-sm rounded-sm border ${
                    sizes.includes(size)
                      ? 'bg-primary text-white border-primary'
                      : 'border-border'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">
              Stock by Size (optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sizeOptions.map((size) => (
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
              ))}
            </div>
          </div>

          {formError && <p className="text-sm text-error">{formError}</p>}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </ProductDetailLayout>
    </div>
  );
}
