'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flower2, BookHeart, Target, BarChart2, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
    icon: BarChart2,
    color: 'text-sky-300',
    shadowColor: 'shadow-sky-500/50',
  },
];

const RADIUS = 200; // Radius for the circular layout
const ICON_SIZE = 80; // Size of the circular buttons

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <motion.div
        className="relative"
        style={{ width: RADIUS * 2, height: RADIUS * 2 }}
      >
        {/* Central Orb */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 40px -10px hsl(var(--primary))',
              '0 0 60px -10px hsl(var(--primary))',
              '0 0 40px -10px hsl(var(--primary))',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center"
        >
           <h1 className="text-xl font-bold font-headline text-primary-foreground/80">
             Bloom
           </h1>
        </motion.div>

        {/* Orbiting Nav Items */}
        {navItems.map((item, index) => {
          const angle = (index / navItems.length) * 2 * Math.PI - Math.PI / 2;
          const x = RADIUS * Math.cos(angle);
          const y = RADIUS * Math.sin(angle);

          return (
            <Link href={item.href} key={item.href}>
              <motion.div
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{ x, y, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2 + index * 0.1,
                }}
                whileHover={{ scale: 1.15, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  translateX: '-50%',
                  translateY: '-50%',
                }}
              >
                <div
                  className={`w-full h-full rounded-full flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg ${item.shadowColor} cursor-pointer transition-all duration-300 hover:border-white/30`}
                >
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                  <span className={`mt-1 text-xs font-semibold ${item.color}`}>
                    {item.label}
                  </span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
