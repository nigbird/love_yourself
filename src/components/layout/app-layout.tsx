
'use server';

import type { ReactNode } from "react";
import { HeartHandshake, Star, Settings } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getUserRewardPoints } from "@/app/user/actions";
import { NotificationCenter } from "../notifications/notification-center";
import { BackButton } from "./back-button";

interface AppLayoutProps {
  children: ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const points = await getUserRewardPoints();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <BackButton />
          <a href="/" className="flex items-center space-x-2 mr-6">
            <HeartHandshake className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline text-primary">Bloom Daily</span>
          </a>
          <div className="flex-grow"></div>
          <nav className="flex items-center gap-6">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/rewards" className="relative text-muted-foreground hover:text-primary transition-colors">
                            <Star />
                            <Badge variant="secondary" className="absolute -top-2 -right-3 px-1.5 py-0 text-xs">{points}</Badge>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Reward Points</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>

             <NotificationCenter />
             
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                            <Settings />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Settings</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </nav>
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
