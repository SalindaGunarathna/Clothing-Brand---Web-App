import React, { createContext, useContext, useEffect, useState } from 'react';
import { login, register, refresh, logout, getMe } from '../authApi';
import type { AuthResponse } from '../authApi';
import type { ToastType, User } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<User>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

const AUTH_KEY = 'maison-auth';
const GUEST_ID_KEY = 'maison-guest-id';

export function useAuthState(
  addToast: (message: string, type: ToastType) => void
): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthStorage = () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const persistAuth = (auth: AuthResponse, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_KEY, JSON.stringify({ ...auth, rememberMe }));
    if (rememberMe) {
      sessionStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  };

  const loadStoredAuth = (): (AuthResponse & { rememberMe: boolean }) | null => {
    const local = localStorage.getItem(AUTH_KEY);
    const session = sessionStorage.getItem(AUTH_KEY);
    const raw = session || local;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse & { rememberMe: boolean };
    } catch {
      return null;
    }
  };

  const applyAuth = (auth: AuthResponse, rememberMe: boolean) => {
    setUser(auth.user);
    setToken(auth.token);
    setRefreshToken(auth.refreshToken);
    persistAuth(auth, rememberMe);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setAuthError(null);
    clearAuthStorage();
  };

  useEffect(() => {
    const storedAuth = loadStoredAuth();
    if (!storedAuth) return;
    if (storedAuth.refreshToken) {
      setIsAuthLoading(true);
      refresh(storedAuth.refreshToken)
        .then((auth) => {
          applyAuth(auth, storedAuth.rememberMe);
        })
        .catch(async () => {
          if (storedAuth.token) {
            try {
              const profile = await getMe(storedAuth.token);
              applyAuth(
                {
                  token: storedAuth.token,
                  refreshToken: '',
                  user: profile.user
                },
                storedAuth.rememberMe
              );
              return;
            } catch {
              // fall through to clear auth
            }
          }
          clearAuth();
        })
        .finally(() => setIsAuthLoading(false));
      return;
    }
    if (storedAuth.token && storedAuth.user) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
      setRefreshToken(storedAuth.refreshToken || null);
    }
  }, []);

  const handleLogin = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const response = await login({
        email,
        password,
        guestId: localStorage.getItem(GUEST_ID_KEY) || undefined
      });
      applyAuth(response, rememberMe);
      addToast(`Welcome back, ${response.user.name}!`, 'success');
      return response.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setAuthError(message);
      addToast(message, 'error');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const response = await register({
        name,
        email,
        password,
        guestId: localStorage.getItem(GUEST_ID_KEY) || undefined
      });
      applyAuth(response, rememberMe);
      addToast('Account created successfully!', 'success');
      return response.user;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      setAuthError(message);
      addToast(message, 'error');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthLoading(true);
    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch {
      // ignore logout errors
    } finally {
      clearAuth();
      addToast('Logged out successfully', 'info');
      setIsAuthLoading(false);
    }
  };

  return {
    user,
    token,
    refreshToken,
    isAuthenticated: !!user,
    isAuthLoading,
    authError,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  };
}

export function AuthProvider({
  children,
  value
}: {
  children: React.ReactNode;
  value: AuthContextType;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
