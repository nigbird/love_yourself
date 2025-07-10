import type { ReactNode } from "react";
import { Flower2 } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <a href="/" className="flex items-center space-x-2">
            <Flower2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline text-primary">Bloom Daily</span>
          </a>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border/40 py-6 md:py-8">
          <div className="container flex items-center justify-center">
              <p className="text-center text-sm text-muted-foreground">
              Built for your growth journey.
              </p>
          </div>
      </footer>
    </div>
  );
}
