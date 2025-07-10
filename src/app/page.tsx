'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Flower2, BookHeart, Target, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/routines',
    label: 'Routines',
    icon: Flower2,
    position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+20px)]',
  },
  {
    href: '/goals',
    label: 'Goals',
    icon: Target,
    position: 'top-1/2 right-0 translate-x-[calc(100%+20px)] -translate-y-1/2',
  },
  {
    href: '/journal',
    label: 'Journal',
    icon: BookHeart,
    position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+20px)]',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart2,
    position: 'top-1/2 left-0 -translate-x-[calc(100%+20px)] -translate-y-1/2',
  },
];

const NavButton = ({
  href,
  label,
  icon: Icon,
  position,
  className,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  position: string;
  className?: string;
}) => (
  <Link href={href} passHref>
    <motion.div
      className={cn('absolute', position)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative group">
        <div
          className={cn(
            'relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-card shadow-lg border-2 border-primary/50 cursor-pointer transition-all duration-300 group-hover:border-primary',
            className
          )}
        >
          <Icon className="w-10 h-10 text-primary/80 group-hover:text-primary" />
        </div>
        <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300 animate-pulse-slow"></div>
        <p className="text-center text-sm font-medium text-foreground/80 mt-2 absolute -bottom-8 left-0 right-0">
          {label}
        </p>
      </div>
    </motion.div>
  </Link>
);

export default function CircularHomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-background overflow-hidden">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Central Core */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: 360 }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="absolute w-full h-full"
        >
          <div className="w-full h-full rounded-full bg-primary/10 border border-primary/20"></div>
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.02, 1], rotate: -360 }}
          transition={{
            duration: 30,
            ease: 'linear',
            repeat: Infinity,
            delay: 2,
          }}
          className="absolute w-3/4 h-3/4"
        >
          <div className="w-full h-full rounded-full bg-accent/10 border border-accent/20"></div>
        </motion.div>
        <div className="relative z-10 flex items-center justify-center w-32 h-32 rounded-full bg-card shadow-2xl">
          <Home className="w-12 h-12 text-primary" />
        </div>

        {/* Navigation Buttons */}
        {navItems.map((item) => (
          <NavButton key={item.href} {...item} />
        ))}
      </div>
    </main>
  );
}

// Add custom animation to tailwind config
// tailwind.config.ts
/*
...
      animation: {
        ...
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
...
*/
