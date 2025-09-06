'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển hướng về dashboard
    if (state.isAuthenticated) {
      router.push('/dashboard');
    } else {
      // Nếu chưa đăng nhập, chuyển hướng về trang login
      router.push('/auth/login');
    }
  }, [state.isAuthenticated, router]);

  // Loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
