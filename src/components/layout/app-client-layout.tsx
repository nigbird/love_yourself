
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
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);
  
  useEffect(() => {
    if (!loading) {
      if (!user && isProtectedRoute) {
        router.push('/login');
      }
      if (user && isAuthRoute) {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname, isAuthRoute, isProtectedRoute]);

  // For auth pages, render children directly without the main layout
  // This prevents the layout from showing on login/signup pages
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <AppLayout user={dbUser}>
      {children}
    </AppLayout>
  );
}
