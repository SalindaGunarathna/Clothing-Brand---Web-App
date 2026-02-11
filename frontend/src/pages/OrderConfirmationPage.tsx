import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function OrderConfirmationPage() {
  const { id } = useParams();
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center animate-fade-in">
      <div className="h-20 w-20 bg-success/10 rounded-full flex items-center justify-center mb-6 text-success">
        <CheckCircle className="h-10 w-10" />
      </div>

      <h1 className="text-4xl font-serif mb-4">Order Confirmed!</h1>
      <p className="text-text-secondary max-w-md mb-8">
        Thank you for your purchase. Your order{' '}
        <span className="font-medium text-text">#{id}</span> has been received
        and is being processed. You will receive an email confirmation shortly.
      </p>

      <div className="flex gap-4">
        <Link to="/my-orders">
          <Button variant="secondary">View Order</Button>
        </Link>
        <Link to="/shop">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    </div>);

}