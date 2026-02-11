import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter } from
'lucide-react';
import { useCart, useAuth } from '../../lib/store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
export function AppShell({ children }: {children: React.ReactNode;}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border transition-all duration-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2 text-text hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}>

            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-serif tracking-tight font-bold text-primary hover:opacity-80 transition-opacity">

            MAISON
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/shop?category=WOMEN"
              className="text-sm font-medium hover:text-accent transition-colors">

              WOMEN
            </Link>
            <Link
              to="/shop?category=MEN"
              className="text-sm font-medium hover:text-accent transition-colors">

              MEN
            </Link>
            <Link
              to="/shop?category=KIDS"
              className="text-sm font-medium hover:text-accent transition-colors">

              KIDS
            </Link>
            <Link
              to="/shop"
              className="text-sm font-medium hover:text-accent transition-colors">

              ALL
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-text hover:text-accent transition-colors">

              <Search className="h-5 w-5" />
            </button>

            {user ?
            <div className="relative group hidden sm:block">
                <Link
                to="/my-orders"
                className="p-2 flex items-center gap-2 text-text hover:text-accent transition-colors">

                  <UserIcon className="h-5 w-5" />
                </Link>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border shadow-lg rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs text-text-secondary border-b border-border mb-1">
                      Signed in as <br />{' '}
                      <span className="font-medium text-text">{user.name}</span>
                    </div>
                    <Link
                    to="/my-orders"
                    className="block px-3 py-2 text-sm hover:bg-surface-alt rounded-sm">

                      My Orders
                    </Link>
                    <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-error hover:bg-surface-alt rounded-sm">

                      Logout
                    </button>
                  </div>
                </div>
              </div> :

            <Link
              to="/login"
              className="hidden sm:block p-2 text-text hover:text-accent transition-colors">

                <UserIcon className="h-5 w-5" />
              </Link>
            }

            <Link
              to="/cart"
              className="p-2 text-text hover:text-accent transition-colors relative">

              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 &&
              <span className="absolute top-0 right-0 h-4 w-4 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              }
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen &&
        <div className="absolute top-full left-0 w-full bg-white border-b border-border p-4 animate-slide-up shadow-lg">
            <div className="container mx-auto max-w-2xl">
              <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('search');
                const encoded = encodeURIComponent(String(query || ''));
                navigate(`/shop?search=${encoded}`);
                setIsSearchOpen(false);
              }}
              className="relative">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                name="search"
                autoFocus
                placeholder="Search for products..."
                className="w-full h-12 pl-10 pr-4 bg-surface-alt rounded-sm focus:outline-none focus:ring-1 focus:ring-accent" />

              </form>
            </div>
          </div>
        }
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)} />

          <div className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl animate-slide-in-right transform transition-transform duration-300 ease-in-out">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <span className="text-xl font-serif font-bold">MAISON</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-4">
              <Link
              to="/shop?category=WOMEN"
              className="block text-lg font-medium py-2 border-b border-border/50">

                Women
              </Link>
              <Link
              to="/shop?category=MEN"
              className="block text-lg font-medium py-2 border-b border-border/50">

                Men
              </Link>
              <Link
              to="/shop?category=KIDS"
              className="block text-lg font-medium py-2 border-b border-border/50">

                Kids
              </Link>
              <Link
              to="/shop"
              className="block text-lg font-medium py-2 border-b border-border/50">

                All Products
              </Link>

              <div className="pt-8">
                {user ?
              <>
                    <div className="mb-4 text-sm text-text-secondary">
                      Signed in as {user.name}
                    </div>
                    <Link
                  to="/my-orders"
                  className="block py-2 text-text hover:text-accent">

                      My Orders
                    </Link>
                    <button onClick={logout} className="block py-2 text-error">
                      Logout
                    </button>
                  </> :

              <div className="space-y-3">
                    <Link to="/login">
                      <Button fullWidth variant="secondary">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button fullWidth>Sign Up</Button>
                    </Link>
                  </div>
              }
              </div>
            </nav>
          </div>
        </div>
      }

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-6">
              <h3 className="text-2xl font-serif">MAISON</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Timeless essentials for the modern wardrobe. Crafted with care,
                designed to last.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors">

                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors">

                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors">

                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-serif text-lg mb-6">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link
                    to="/shop?category=WOMEN"
                    className="hover:text-white transition-colors">

                    Women
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop?category=MEN"
                    className="hover:text-white transition-colors">

                    Men
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop?category=KIDS"
                    className="hover:text-white transition-colors">

                    Kids
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="hover:text-white transition-colors">

                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-serif text-lg mb-6">Help</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-serif text-lg mb-6">Stay in the loop</h4>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to receive updates, access to exclusive deals, and
                more.
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-light border border-gray-800 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-accent w-full" />

                <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2025 MAISON. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}
