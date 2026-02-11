import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LogOut,
  Settings,
  Menu,
  X } from
'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/store';
import { Button } from '../ui/Button';
export function AdminShell() {
  const location = useLocation();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    exact: false
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    exact: false
  }];

  const isActive = (path: string, exact: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  return (
    <div className="min-h-screen bg-surface-alt flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen &&
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setIsSidebarOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>

        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link
            to="/admin"
            className="text-2xl font-serif font-bold tracking-tight">

            MAISON
            <span className="text-xs font-sans font-normal text-gray-400 block tracking-widest uppercase mt-1">
              Admin Portal
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white">

            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) =>
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setIsSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors',
              isActive(item.href, item.exact) ?
              'bg-white/10 text-white' :
              'text-gray-400 hover:text-white hover:bg-white/5'
            )}>

              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium text-error hover:bg-white/5 transition-colors">

            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Mobile only) */}
        <header className="lg:hidden bg-white border-b border-border p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-text" />
          </button>
          <span className="font-serif font-bold text-lg">MAISON Admin</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>);

}