'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Which role is required. Defaults to 'Member'. */
  requiredRole?: 'Member' | 'Admin';
}

export default function AuthGuard({ children, requiredRole = 'Member' }: AuthGuardProps) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole === 'Admin' && user?.role !== 'Admin') {
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [isLoggedIn, isLoading, user, router, pathname, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0705] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#C9B79C] text-sm font-semibold">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (requiredRole === 'Admin' && user?.role !== 'Admin') return null;

  return <>{children}</>;
}
