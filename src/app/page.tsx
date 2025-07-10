'use client';

import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Flower2, BookHeart, Target, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  {
    href: '/routines',
    label: 'Routines',
    icon: Flower2,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
  },
  {
    href: '/goals',
    label: 'Goals',
    icon: Target,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    href: '/journal',
    label: 'Journal',
    icon: BookHeart,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart2,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
          Welcome to Bloom Daily
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your personal space for growth and reflection.
        </p>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl"
      >
        <CarouselContent>
          {navItems.map((item, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Link href={item.href}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card className="overflow-hidden transition-all hover:shadow-xl hover:border-primary/50">
                      <CardContent className="flex flex-col aspect-square items-center justify-center p-6 gap-4">
                        <div className="p-4 rounded-full bg-white shadow-inner">
                          <item.icon className="w-12 h-12 text-primary" />
                        </div>
                        <span className="text-xl font-semibold text-foreground/80">{item.label}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}
