import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth, useToast } from '../lib/store';
import { getMe } from '../lib/authApi';
import type { User } from '../lib/types';

export function ProfilePage() {
  const { user, token, isAuthenticated, isAuthLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?redirect=/profile', { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    const controller = new AbortController();
    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getMe(token, controller.signal);
        setProfile(response.user);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message =
          err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    loadProfile();
    return () => controller.abort();
  }, [token, isAuthenticated]);

  const handleRefresh = async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await getMe(token);
      setProfile(response.user);
      addToast('Profile refreshed', 'info');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to refresh profile';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <p className="text-center text-text-secondary">Loading profile...</p>
      </div>);
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto p-6">
          <p className="text-sm text-error mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </Card>
      </div>);
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto p-6">
          <p className="text-sm text-text-secondary">
            Profile details are unavailable.
          </p>
        </Card>
      </div>);
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif mb-1">My Profile</h1>
            <p className="text-text-secondary text-sm">
              Manage your account details.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">
                Name
              </p>
              <p className="text-lg font-medium">{profile.name}</p>
            </div>
            <Badge variant="accent">{profile.role}</Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-text-secondary">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-text-secondary">User ID</p>
              <p className="font-mono text-xs break-all">{profile.id}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>);
}
