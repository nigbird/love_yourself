
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, MoreVertical, Edit, Trash2, Home, Gift } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import CreateWishForm from '@/components/wish/create-wish-form';
import type { Wish } from '@/domain/entities';

// Mock data for initial display
const mockWishes: Wish[] = [
    {
        id: '1',
        userId: 'user1',
        title: 'Trip to Japan',
        note: 'Visit Kyoto during cherry blossom season.',
        imageUrl: 'https://placehold.co/600x400.png',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        userId: 'user1',
        title: 'New Camera',
        note: 'Sony A7 IV for photography hobby.',
        imageUrl: 'https://placehold.co/600x400.png',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export default function WishlistPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

   // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedWishes = localStorage.getItem('bloom-wishes');
      if (savedWishes) {
        setWishes(JSON.parse(savedWishes));
      } else {
        setWishes(mockWishes); // Initialize with mock data if nothing is saved
      }
    } catch (error) {
        console.error("Failed to load wishes from localStorage", error);
        setWishes(mockWishes); // Fallback to mock data on error
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
        if(wishes.length > 0) localStorage.setItem('bloom-wishes', JSON.stringify(wishes));
    } catch (error) {
        console.error("Failed to save wishes to localStorage", error);
    }
  }, [wishes]);


  const openCreateForm = () => {
    setEditingWish(null);
    setIsFormOpen(true);
  }

  const openEditForm = (wish: Wish) => {
    setEditingWish(wish);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (data: Omit<Wish, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingWish) {
      // Edit existing wish
      const updatedWishes = wishes.map(w => w.id === editingWish.id ? { ...w, ...data, updatedAt: new Date() } : w);
      setWishes(updatedWishes);
      toast({ title: "Wish Updated!", description: `"${data.title}" has been saved.` });
    } else {
      // Create new wish
      const newWish: Wish = {
        id: new Date().toISOString(),
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      setWishes([newWish, ...wishes]);
      toast({ title: "Wish Added!", description: `"${data.title}" has been added to your wishlist.` });
    }
    setIsFormOpen(false);
    setEditingWish(null);
  };

  const handleDeleteWish = (wishId: string) => {
    setWishes(wishes.filter(w => w.id !== wishId));
    toast({ title: "Wish Removed", variant: 'destructive' });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-5xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">My Wishlist</h1>
          <p className="text-muted-foreground">
            A collection of your dreams, big and small.
          </p>
        </div>

        <div className="text-center">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openCreateForm} size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                        <PlusCircle className="mr-2"/>
                        Add a New Wish
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] bg-background/95 backdrop-blur-sm">
                    <DialogHeader>
                    <DialogTitle className="text-primary text-2xl">{editingWish ? 'Edit Wish' : 'New Wish'}</DialogTitle>
                    </DialogHeader>
                    <CreateWishForm 
                      onWishSubmitted={handleFormSubmit} 
                      wishToEdit={editingWish || undefined}
                    />
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {wishes.map(wish => (
                <Card key={wish.id} className="bg-card/50 backdrop-blur-sm border-white/10 flex flex-col overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between p-4">
                        <CardTitle className="text-xl text-primary flex items-center gap-2"><Gift className="w-5 h-5"/>{wish.title}</CardTitle>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditForm(wish)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this wish.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteWish(wish.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                       {wish.imageUrl && (
                         <div className="aspect-video relative w-full">
                            <Image src={wish.imageUrl} alt={wish.title} layout="fill" objectFit="cover" data-ai-hint="dream travel" />
                         </div>
                       )}
                       <div className="p-4">
                        <p className="text-muted-foreground">{wish.note}</p>
                       </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="text-center mt-8">
            <Button asChild variant="ghost">
                <Link href="/"><Home className="mr-2"/> Back to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
