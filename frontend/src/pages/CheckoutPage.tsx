import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useToast, useAuth } from '../lib/store';
import { checkoutOrder } from '../lib/ordersApi';
import { calculateTotal, formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CheckCircle } from 'lucide-react';
export function CheckoutPage() {
  const { items, cartTotal, clearCart, isCartLoading } = useCart();
  const { isAuthenticated, isAuthLoading, token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const total = calculateTotal(cartTotal);
  // Mock form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!token) {
      addToast('Please log in to place your order.', 'error');
      setIsLoading(false);
      return;
    }
    try {
      const orderId = await checkoutOrder(token, {
        email: formData.email.trim() || undefined,
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip
        }
      });
      await clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to place order';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!isAuthLoading && !isCartLoading && !isAuthenticated) {
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [isAuthLoading, isCartLoading, isAuthenticated, navigate]);

  if (isAuthLoading || isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <p className="text-center text-text-secondary">Loading cart...</p>
      </div>);

  }
  if (!isAuthenticated) {
    return null;
  }
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-serif mb-8 text-center">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Checkout Form */}
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-serif border-b border-border pb-2">
              Contact Information
            </h2>
            <Input
              name="email"
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange} />

          </section>

          {/* Shipping Address */}
          <section className="space-y-4">
            <h2 className="text-xl font-serif border-b border-border pb-2">
              Shipping Address
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleInputChange} />

              <Input
                name="lastName"
                label="Last Name"
                required
                value={formData.lastName}
                onChange={handleInputChange} />

            </div>
            <Input
              name="address"
              label="Address"
              required
              value={formData.address}
              onChange={handleInputChange} />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="city"
                label="City"
                required
                value={formData.city}
                onChange={handleInputChange} />

              <Input
                name="zip"
                label="ZIP Code"
                required
                value={formData.zip}
                onChange={handleInputChange} />

            </div>
            <Input
              name="phone"
              label="Mobile Number"
              required
              value={formData.phone}
              onChange={handleInputChange} />
          </section>

          {/* Payment */}
          <section className="space-y-4">
            <h2 className="text-xl font-serif border-b border-border pb-2">
              Payment Details
            </h2>
            <Input
              name="cardName"
              label="Name on Card"
              required
              value={formData.cardName}
              onChange={handleInputChange} />

            <Input
              name="cardNumber"
              label="Card Number"
              placeholder="0000 0000 0000 0000"
              required
              value={formData.cardNumber}
              onChange={handleInputChange} />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="expiry"
                label="Expiry Date"
                placeholder="MM/YY"
                required
                value={formData.expiry}
                onChange={handleInputChange} />

              <Input
                name="cvc"
                label="CVC"
                placeholder="123"
                required
                value={formData.cvc}
                onChange={handleInputChange} />

            </div>
          </section>
        </form>

        {/* Order Summary */}
        <div className="bg-surface-alt/50 p-8 rounded-sm h-fit sticky top-24">
          <h2 className="text-xl font-serif mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
            {items.map((item) =>
            <div
              key={item.id}
              className="flex gap-4">

                <div className="relative h-16 w-12 bg-white rounded-sm overflow-hidden shrink-0">
                  <img
                  src={item.product.imageUrl}
                  alt=""
                  className="h-full w-full object-cover" />

                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-text text-white text-[10px] flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-xs text-text-secondary">
                    {item.size}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-lg font-medium pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            fullWidth
            size="lg"
            isLoading={isLoading}>

            Place Order
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary">
            <CheckCircle className="h-3 w-3" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>);

}
