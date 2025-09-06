'use client';

import React from 'react';
import { Loader2, Coffee, Leaf } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-coffee-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size], colorClasses[color])} />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

// Page Loading Component
interface PageLoadingProps {
  message?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Đang tải...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="relative">
          <Coffee className="h-16 w-16 text-coffee-600 mx-auto animate-pulse" />
          <Leaf className="h-8 w-8 text-green-600 absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Coffee & Tea</h2>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
};

// Card Loading Skeleton
interface CardLoadingProps {
  count?: number;
  className?: string;
}

const CardLoading: React.FC<CardLoadingProps> = ({ 
  count = 4, 
  className 
}) => {
  return (
    <div className={cn('grid gap-6', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-200"></div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// List Loading Skeleton
const ListLoading: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Button Loading
interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({ 
  loading = false, 
  children, 
  className,
  ...props 
}) => {
  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'relative inline-flex items-center justify-center',
        loading && 'cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      )}
      {children}
    </button>
  );
};

export {
  LoadingSpinner,
  PageLoading,
  CardLoading,
  ListLoading,
  ButtonLoading
};
