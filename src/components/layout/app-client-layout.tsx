
'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { AppLayout } from '@/components/layout/app-layout';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const protectedRoutes = ['/routines', '/goals', '/journal', '/analytics', '/wish', '/rewards', '/settings'];
const authRoutes = ['/login', '/signup'];

export function AppClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      const isAuthRoute = authRoutes.includes(pathname);

      if (!user && isProtectedRoute) {
        router.push('/login');
      }
      if (user && isAuthRoute) {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  // Don't render layout for auth pages until loading is complete
  if (loading && authRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Allow auth pages to render without the main layout shell
  if (!user && authRoutes.includes(pathname)) {
      return <>{children}</>;
  }

  return (
    <AppLayout isLoggedIn={!!user} points={dbUser?.rewardPoints ?? 0}>
      {children}
    </AppLayout>
  );
}
