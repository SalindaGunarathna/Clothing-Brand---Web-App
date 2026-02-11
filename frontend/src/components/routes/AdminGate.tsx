import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AdminShell } from '../layout/AdminShell';
import { useAuth } from '../../lib/store';

export function AdminGate() {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-secondary">
        Loading admin...
      </div>);
  }

  if (!user) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <AdminShell />;
}
