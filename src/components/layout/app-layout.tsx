
'use client';

import type { ReactNode } from "react";
import { HeartHandshake, Star, Settings } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationCenter } from "../notifications/notification-center";
import { Button } from "../ui/button";
import type { User } from "@/domain/entities";
import { UserNav } from './user-nav';

interface AppLayoutProps {
  children: ReactNode;
  user: User | null;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const isLoggedIn = !!user;
  const points = user?.rewardPoints ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <HeartHandshake className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline text-primary">Bloom Daily</span>
          </Link>
          <div className="flex-grow"></div>
          {isLoggedIn ? (
             <nav className="flex items-center gap-4 sm:gap-6">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/rewards" className="text-muted-foreground hover:text-primary transition-colors">
                                <div className="relative">
                                    <Star />
                                    <Badge variant="secondary" className="absolute -top-2 -right-3 px-1.5 py-0 text-xs">{points}</Badge>
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Reward Points</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>

                 <NotificationCenter />
                 
                 <UserNav />

              </nav>
          ) : (
            <nav className="flex items-center gap-2">
                <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </nav>
          )}
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
