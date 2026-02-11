import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(email);
      setIsLoading(false);
      navigate('/');
    }, 1000);
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

          <Button type="submit" fullWidth isLoading={isLoading}>
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