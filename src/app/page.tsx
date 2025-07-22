
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flower2, BookHeart, Target, Gift, BarChart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  shadowColor: string;
}

const navItems: NavItem[] = [
  {
    href: '/routines',
    label: 'Routines',
    icon: Flower2,
    color: 'text-rose-300',
    shadowColor: 'shadow-rose-500/50',
  },
  {
    href: '/goals',
    label: 'Goals',
    icon: Target,
    color: 'text-teal-300',
    shadowColor: 'shadow-teal-500/50',
  },
  {
    href: '/journal',
    label: 'Journal',
    icon: BookHeart,
    color: 'text-amber-300',
    shadowColor: 'shadow-amber-500/50',
  },
   {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart,
    color: 'text-indigo-300',
    shadowColor: 'shadow-indigo-500/50',
  },
  {
    href: '/wish',
    label: 'Wishlist',
    icon: Gift,
    color: 'text-sky-300',
    shadowColor: 'shadow-sky-500/50',
  },
];

export default function HomePage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-background text-center px-4">
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-10 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold font-headline text-primary"
        >
          Hello love, let’s bloom slowly
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Your personal sanctuary for growth and reflection. Begin your journey below.
        </motion.p>
      </div>

      <div className="relative w-full max-w-4xl mt-12 z-10">
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 justify-center">
            {navItems.map((item, index) => (
              <CarouselItem key={index} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <div className="p-1">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex justify-center"
                  >
                    <Link
                      href={item.href}
                      className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg ${item.shadowColor} cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 overflow-hidden`}
                    >
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          background: `radial-gradient(circle, hsl(var(--primary)) 0 0, transparent 70%)`,
                        }}
                      ></div>
                      <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <item.icon className={`w-10 h-10 ${item.color}`} />
                        <span
                          className={`mt-3 text-lg font-bold ${item.color}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: count }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                        current === index ? 'w-4 bg-primary' : 'bg-muted'
                    }`}
                />
            ))}
        </div>
      </div>
    </div>
  );
}
