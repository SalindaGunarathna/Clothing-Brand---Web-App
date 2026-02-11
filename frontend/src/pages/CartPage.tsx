import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart, useAuth } from '../lib/store';
import { formatCategory, formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { EmptyState } from '../components/ui/EmptyState';
export function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    cartTotal,
    isCartLoading
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-text-secondary">
        Loading cart...
      </div>);

  }
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={{
            label: 'Start Shopping',
            onClick: () => navigate('/shop')
          }} />

      </div>);

  }
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-serif mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) =>
          <div
            key={item.id}
            className="flex gap-6 p-6 border border-border rounded-sm bg-white">

              <Link
              to={`/product/${item.product.id}`}
              className="shrink-0 w-24 h-32 bg-surface-alt rounded-sm overflow-hidden">

                <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-full h-full object-cover" />

              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                    to={`/product/${item.product.id}`}
                    className="font-serif text-lg hover:text-accent transition-colors">

                      {item.product.name}
                    </Link>
                    <p className="text-sm text-text-secondary mt-1">
                      Size: {item.size}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Category: {formatCategory(item.product.category)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <QuantityStepper
                  value={item.quantity}
                  onChange={(val) =>
                  updateQuantity(item.id, val)
                  } />

                  <button
                  onClick={() =>
                  removeFromCart(item.id)
                  }
                  className="text-sm text-error hover:text-red-700 flex items-center gap-1 transition-colors">

                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-alt/50 p-6 rounded-sm sticky top-24">
            <h2 className="text-xl font-serif mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 border-b border-border pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax (Estimated)</span>
                <span className="font-medium">
                  {formatPrice(cartTotal * 0.08)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-medium mb-8">
              <span>Total</span>
              <span>{formatPrice(cartTotal * 1.08)}</span>
            </div>

            {isAuthenticated ?
            <Link to="/checkout">
                <Button fullWidth size="lg">
                  Proceed to Checkout
                </Button>
              </Link> :
            <Link to="/login?redirect=/checkout">
                <Button fullWidth size="lg" variant="secondary">
                  Log In to Checkout
                </Button>
              </Link>
            }

            {!isAuthenticated &&
            <p className="text-xs text-center text-text-secondary mt-4">
                Log in to place your order and track it later.
              </p>
            }
          </div>
        </div>
      </div>
    </div>);

}
