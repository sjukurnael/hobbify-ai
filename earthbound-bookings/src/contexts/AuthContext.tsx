import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, tokenManager } from '@/services/api';
import { useSearchParams } from 'react-router-dom';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check for token in URL (from OAuth redirect)
    const token = searchParams.get('token');
    if (token) {
      tokenManager.setToken(token);
      // Remove token from URL
      searchParams.delete('token');
      setSearchParams(searchParams);
    }

    // Load user if token exists
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = tokenManager.getToken();
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      tokenManager.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isInstructor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}