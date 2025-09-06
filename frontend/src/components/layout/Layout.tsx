// Layout Component - Main Application Layout
// Coffee & Tea E-commerce

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '@/components/error/ErrorBoundary';

// ============================================
// LAYOUT INTERFACE
// ============================================

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// LAYOUT COMPONENT
// ============================================

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      
      {/* Main Content */}
      <main className={`flex-1 ${className || ''}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      {/* Footer */}
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
