import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');
  const { register, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const user = await register(name, email, password, rememberMe);
      const target = user.role === 'ADMIN' ? '/admin' : redirect;
      navigate(target, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      setFormError(message);
    }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold">Create Account</h1>
          <p className="mt-2 text-text-secondary">
            Join MAISON for exclusive access
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-sm border border-border shadow-sm">

          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe" />


          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com" />


          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            helperText="Must be at least 8 characters" />

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
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline">

            Sign in
          </Link>
        </p>
      </div>
    </div>);

}
