import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Flower2, Target, BookHeart, BarChart2 } from 'lucide-react';

const navLinks = [
    { href: "/routines", label: "Routines", icon: Flower2 },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/journal", label: "Journal", icon: BookHeart },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
]

export function Header() {
    return (
        <header className="bg-card border-b sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center p-4">
                <Link href="/" className="flex items-center gap-2">
                     <Flower2 className="w-8 h-8 text-primary" />
                    <h1 className="text-xl font-bold font-headline text-primary">Bloom Daily</h1>
                </Link>
                <nav className="hidden md:flex gap-2">
                    {navLinks.map(link => (
                         <Button key={link.href} variant="ghost" asChild>
                            <Link href={link.href} className="flex items-center gap-2">
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        </Button>
                    ))}
                </nav>
                 <Button className="md:hidden" variant="ghost" size="icon">
                    <Home className="w-6 h-6" />
                </Button>
            </div>
        </header>
    );
}
