import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { resetPassword } from '../lib/authApi';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token') || '';
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!token.trim()) {
      setError('Reset token is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await resetPassword({
        token: token.trim(),
        newPassword
      });
      setMessage(response.message || 'Password reset successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to reset password';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold">Reset Password</h1>
          <p className="mt-2 text-text-secondary">
            Enter your reset token and a new password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-sm border border-border shadow-sm">

          <Input
            label="Reset Token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste the token from your email" />

          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            helperText="Must be at least 8 characters" />

          <Input
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••" />

          {error &&
          <p className="text-xs text-error">{error}</p>
          }

          {message &&
          <p className="text-xs text-text-secondary">{message}</p>
          }

          <Button type="submit" fullWidth isLoading={isLoading}>
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Back to{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline">

            Sign in
          </Link>
        </p>
      </div>
    </div>);
}
