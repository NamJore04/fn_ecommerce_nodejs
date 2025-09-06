'use client';

// Authentication Context - Coffee & Tea E-commerce Frontend
// Manages user authentication state across the application

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService, AuthService } from '../services/api.service';
import { User } from '../types';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// ============================================
// ACTION TYPES
// ============================================

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// ============================================
// REDUCER
// ============================================

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// CONTEXT PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    // Check if user is already logged in when app starts
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if there's a stored token
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Try to get user profile
          const response = await authService.getProfile();
          if (response.success && response.data) {
            dispatch({ type: 'SET_USER', payload: response.data });
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await authService.login(email, password);
      
      if (response.success && response.data) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'REGISTER_START' });

      const response = await authService.register(data);
      
      if (response.success && response.data) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: response.data.user });
      } else {
        throw new Error(response.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      dispatch({ type: 'REGISTER_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If profile fetch fails, user might be logged out
      dispatch({ type: 'LOGOUT' });
    }
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// UTILITY HOOKS
// ============================================

export function useUser(): User | null {
  const { state } = useAuth();
  return state.user;
}

export function useIsAuthenticated(): boolean {
  const { state } = useAuth();
  return state.isAuthenticated;
}

export function useAuthLoading(): boolean {
  const { state } = useAuth();
  return state.isLoading;
}

export function useAuthError(): string | null {
  const { state } = useAuth();
  return state.error;
}

// ============================================
// HOC FOR PROTECTED ROUTES
// ============================================

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { state } = useAuth();

    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!state.isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

export function useHasRole(roles: string[]): boolean {
  const user = useUser();
  if (!user) return false;
  return roles.includes(user.role);
}

export function useIsAdmin(): boolean {
  return useHasRole(['ADMIN', 'SUPER_ADMIN']);
}

export function useIsStaff(): boolean {
  return useHasRole(['STAFF', 'ADMIN', 'SUPER_ADMIN']);
}

export default AuthContext;
