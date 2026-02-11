import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');
  const { login, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const user = await login(email, password, rememberMe);
      const target = user.role === 'ADMIN' ? '/admin' : redirect;
      navigate(target, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed';
      setFormError(message);
    }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold">Welcome Back</h1>
          <p className="mt-2 text-text-secondary">
            Sign in to access your account
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


          <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-text-secondary hover:text-text hover:underline">

                Forgot password?
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded-sm border-border text-primary focus:ring-accent" />

            Remember me
          </label>

          {formError &&
          <p className="text-xs text-error">{formError}</p>
          }

          <Button type="submit" fullWidth isLoading={isAuthLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline">

            Create one
          </Link>
        </p>
      </div>
    </div>);

}
