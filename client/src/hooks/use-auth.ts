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

  // Verify token with server
  const verifyToken = useCallback(async (): Promise<boolean> => {
    const token = authState.token || localStorage.getItem('admin_token');
    
    if (!token) {
      clearAuth();
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
            token: token,
            isAuthenticated: true,
          }));
          return true;
        }
      }
      
      // Token is invalid, try to refresh first
      console.log('Token verification failed, attempting refresh...');
      const refreshed = await refreshToken();
      if (refreshed) {
        return true;
      }
      
      // Both verification and refresh failed, clear auth
      clearAuth();
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Try to refresh token on network error
      try {
        const refreshed = await refreshToken();
        if (refreshed) {
          return true;
        }
      } catch (refreshError) {
        console.error('Token refresh also failed:', refreshError);
      }
      
      clearAuth();
      return false;
    }
  }, [authState.token, clearAuth, refreshToken]);

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
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // If still loading initial auth state, wait
      if (auth.isLoading) {
        return;
      }

      // If not authenticated and not currently verifying, redirect to login
      if (!auth.isAuthenticated && !isVerifying) {
        setLocation('/admin/login');
        return;
      }

      // If authenticated but haven't verified token yet, verify it
      if (auth.isAuthenticated && !isVerifying) {
        setIsVerifying(true);
        try {
          const isValid = await auth.verifyToken();
          if (isMounted) {
            if (!isValid) {
              setLocation('/admin/login');
            }
          }
        } catch (error) {
          console.error('Token verification error:', error);
          if (isMounted) {
            setLocation('/admin/login');
          }
        } finally {
          if (isMounted) {
            setIsVerifying(false);
          }
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [auth.isAuthenticated, auth.isLoading, auth.verifyToken, setLocation, isVerifying]);

  return {
    ...auth,
    isLoading: auth.isLoading || isVerifying,
  };
}