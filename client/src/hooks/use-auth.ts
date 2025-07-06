import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken?: string;
  };
  code?: string;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearAuth();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Clear authentication data
  const clearAuth = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Verify token with server
  const verifyToken = useCallback(async (): Promise<boolean> => {
    const token = authState.token || localStorage.getItem('admin_token');
    
    if (!token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        if (data.success && data.data) {
          setAuthState(prev => ({
            ...prev,
            user: data.data!.user,
            isAuthenticated: true,
          }));
          return true;
        }
      }
      
      // Token is invalid, clear auth
      clearAuth();
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
      return false;
    }
  }, [authState.token, clearAuth]);

  // Refresh access token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include refresh token cookie
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        if (data.success && data.data?.accessToken) {
          localStorage.setItem('admin_token', data.data.accessToken);
          setAuthState(prev => ({
            ...prev,
            token: data.data!.accessToken!,
            isAuthenticated: true,
          }));
          return true;
        }
      }
      
      clearAuth();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearAuth();
      setLocation('/admin/login');
    }
  }, [clearAuth, setLocation]);

  // API request wrapper with automatic token refresh
  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = authState.token || localStorage.getItem('admin_token');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await refreshToken();
      
      if (refreshed) {
        const newToken = localStorage.getItem('admin_token');
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } else {
        // Refresh failed, redirect to login
        setLocation('/admin/login');
        throw new Error('Authentication failed');
      }
    }

    return response;
  }, [authState.token, refreshToken, setLocation]);

  // Check if user has required role
  const hasRole = useCallback((requiredRole: string): boolean => {
    return authState.user?.role === requiredRole;
  }, [authState.user]);

  // Require authentication (redirect to login if not authenticated)
  const requireAuth = useCallback(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      setLocation('/admin/login');
      return false;
    }
    return authState.isAuthenticated;
  }, [authState.isAuthenticated, authState.isLoading, setLocation]);

  return {
    ...authState,
    verifyToken,
    refreshToken,
    logout,
    authenticatedFetch,
    hasRole,
    requireAuth,
    clearAuth,
  };
}

// Hook for protecting admin routes
export function useRequireAuth() {
  const auth = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        setLocation('/admin/login');
      } else {
        // Verify token on mount
        auth.verifyToken();
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.verifyToken, setLocation]);

  return auth;
}