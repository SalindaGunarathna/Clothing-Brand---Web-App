import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { forgotPassword } from '../lib/authApi';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');
    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.message || 'Check your email for reset instructions.');
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to request reset';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold">Forgot Password</h1>
          <p className="mt-2 text-text-secondary">
            Enter your email to receive reset instructions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-sm border border-border shadow-sm">

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com" />

          {error &&
          <p className="text-xs text-error">{error}</p>
          }

          {message &&
          <div className="text-xs text-text-secondary space-y-2">
              <p>{message}</p>
              {resetToken &&
              <div className="rounded-sm border border-border bg-surface-alt/50 p-3">
                  <p className="font-medium text-text">Dev Reset Token</p>
                  <p className="break-all mt-1">{resetToken}</p>
                  <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="inline-block mt-2 text-primary hover:underline">

                    Use this token
                  </Link>
                </div>
              }
            </div>
          }

          <Button type="submit" fullWidth isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline">

            Sign in
          </Link>
        </p>
      </div>
    </div>);
}
