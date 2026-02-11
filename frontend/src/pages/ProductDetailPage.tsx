import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SizeSelector } from '../components/ui/SizeSelector';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCategory, formatPrice } from '../lib/utils';
import { ProductSize } from '../lib/types';
import { useCart } from '../lib/store';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { fetchProductById } from '../state/productsSlice';

export function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selected, selectedStatus, selectedError } = useAppSelector(
    (state) => state.products
  );
  const { addToCart, isCartLoading } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  if (selectedStatus === 'loading' || selectedStatus === 'idle') {
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

  if (selectedStatus === 'failed') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-text-secondary">
          {selectedError || 'Unable to load product.'}
        </p>
      </div>
    );
  }

  if (!selected) {
    return <div className="p-20 text-center">Product not found</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Please select a size');
      return;
    }
    addToCart(selected.id, selectedSize, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link to="/" className="hover:text-text">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/shop" className="hover:text-text">
          Shop
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text font-medium">{selected.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-sm bg-surface-alt">
            <img
              src={selected.imageUrl}
              alt={selected.name}
              className="h-full w-full object-cover transition-all duration-500" />

          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-8 border-b border-border pb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                {formatCategory(selected.category)}
              </span>
            </div>
            <h1 className="text-4xl font-serif mb-4">{selected.name}</h1>
            <p className="text-2xl font-medium text-text mb-6">
              {formatPrice(selected.price)}
            </p>
            <p className="text-text-secondary leading-relaxed">
              {selected.description}
            </p>
          </div>

          <div className="space-y-8 mb-8">
            {/* Size Selector */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Select Size</span>
                <button className="text-sm text-text-secondary underline hover:text-text">
                  Size Guide
                </button>
              </div>
              <SizeSelector
                sizes={selected.sizes}
                selectedSize={selectedSize}
                onSelect={(size) => {
                  setSelectedSize(size);
                  setError('');
                }}
                error={error}
              />

            </div>

            {/* Quantity */}
            <div>
              <span className="text-sm font-medium mb-2 block">Quantity</span>
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </div>

            {/* Actions */}
            <Button
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              isLoading={isCartLoading}
              disabled={isCartLoading}>

              Add to Cart
            </Button>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-surface-alt/50 rounded-sm">
                <Truck className="h-5 w-5 text-text-secondary" />
                <span className="text-xs font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-surface-alt/50 rounded-sm">
                <RefreshCw className="h-5 w-5 text-text-secondary" />
                <span className="text-xs font-medium">Free Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-surface-alt/50 rounded-sm">
                <ShieldCheck className="h-5 w-5 text-text-secondary" />
                <span className="text-xs font-medium">2-Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
