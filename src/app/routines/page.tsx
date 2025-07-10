
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
import { CreateRoutineForm } from "@/components/routines/create-routine-form";
import { PlusCircle, Zap, MoreVertical, Edit, Trash2, Home, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Routine } from '@/domain/entities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


// Mock data for initial display
const mockRoutines: Routine[] = [
    {
        id: '1',
        userId: 'user1',
        name: 'Hair Wash Day',
        frequency: 'weekly',
        daysOfWeek: [0, 3], // Sunday, Wednesday
        timeOfDay: '20:00',
        rewardPoints: 20,
        remindersEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        userId: 'user1',
        name: 'Meal Prep',
        frequency: 'weekly',
        daysOfWeek: [0], // Sunday
        timeOfDay: '16:00',
        rewardPoints: 50,
        remindersEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '3',
        userId: 'user1',
        name: 'Daily Gratitude',
        frequency: 'daily',
        timeOfDay: '08:00',
        rewardPoints: 10,
        remindersEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

const getDayName = (dayIndex: number) => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
}

type CompletionStatus = {
    [routineId: string]: string; // Store date string 'YYYY-MM-DD'
};

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({});
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedRoutines = localStorage.getItem('bloom-routines');
      const savedCompletionStatus = localStorage.getItem('bloom-completionStatus');
      const savedTotalPoints = localStorage.getItem('bloom-totalPoints');

      if (savedRoutines) {
        setRoutines(JSON.parse(savedRoutines));
      } else {
        setRoutines(mockRoutines); // Initialize with mock data if nothing is saved
      }

      if (savedCompletionStatus) {
        setCompletionStatus(JSON.parse(savedCompletionStatus));
      }

      if (savedTotalPoints) {
        setTotalPoints(JSON.parse(savedTotalPoints));
      }
    } catch (error) {
        console.error("Failed to load from localStorage", error);
        setRoutines(mockRoutines); // Fallback to mock data on error
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
        if(routines.length > 0) localStorage.setItem('bloom-routines', JSON.stringify(routines));
        localStorage.setItem('bloom-completionStatus', JSON.stringify(completionStatus));
        localStorage.setItem('bloom-totalPoints', JSON.stringify(totalPoints));
    } catch (error) {
        console.error("Failed to save to localStorage", error);
    }
  }, [routines, completionStatus, totalPoints]);

  const openCreateForm = () => {
    setEditingRoutine(null);
    setIsFormOpen(true);
  }

  const openEditForm = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (data: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingRoutine) {
      // Edit existing routine
      const updatedRoutines = routines.map(r => r.id === editingRoutine.id ? { ...r, ...data, updatedAt: new Date() } : r);
      setRoutines(updatedRoutines);
      toast({ title: "Routine Updated!", description: `"${data.name}" has been saved.` });
    } else {
      // Create new routine
      const newRoutine: Routine = {
        id: new Date().toISOString(), // Use a more unique ID
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      setRoutines([...routines, newRoutine]);
      toast({ title: "Routine Created!", description: `"${data.name}" has been added.` });
    }
    setIsFormOpen(false);
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines(routines.filter(r => r.id !== routineId));
    toast({ title: "Routine Deleted", variant: 'destructive' });
  }

  const handleMarkAsDone = (routine: Routine) => {
    const today = new Date().toISOString().split('T')[0];
    setCompletionStatus(prev => ({ ...prev, [routine.id]: today }));
    setTotalPoints(prev => prev + routine.rewardPoints);
    toast({
      title: "Routine Complete!",
      description: `Great job! You've earned ${routine.rewardPoints} points.`,
    });
  }

  const isCompletedToday = (routineId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return completionStatus[routineId] === today;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-5xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">Self-Care Routines</h1>
          <p className="text-muted-foreground">
            Plan, track, and build healthy habits for a blooming life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex justify-center items-center">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateForm} size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            <PlusCircle className="mr-2"/>
                            Create New Routine
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] bg-background/95 backdrop-blur-sm">
                        <DialogHeader>
                        <DialogTitle className="text-primary text-2xl">{editingRoutine ? 'Edit Routine' : 'New Self-Care Routine'}</DialogTitle>
                        </DialogHeader>
                        <CreateRoutineForm 
                          onRoutineCreated={handleFormSubmit} 
                          routineToEdit={editingRoutine || undefined}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <Card className="bg-card/50 backdrop-blur-sm border-white/10 text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-primary">
                        <Star />
                        Total Points
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-accent">{totalPoints}</p>
                    <CardDescription>Points earned from completed routines.</CardDescription>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {routines.map(routine => (
                <Card key={routine.id} className="bg-card/50 backdrop-blur-sm border-white/10 flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <CardTitle className="text-xl text-primary">{routine.name}</CardTitle>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditForm(routine)}>
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
                                            This action cannot be undone. This will permanently delete your
                                            routine.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteRoutine(routine.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                           {routine.frequency} at {routine.timeOfDay}
                        </div>
                        {routine.daysOfWeek && routine.daysOfWeek.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {routine.daysOfWeek.map(day => (
                                    <Badge key={day} variant="secondary" className="text-xs">{getDayName(day)}</Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                         <div className="flex items-center gap-1 text-accent font-bold">
                            <Zap className="w-4 h-4"/>
                            <span>{routine.rewardPoints}pts</span>
                        </div>
                        <Button 
                          variant={isCompletedToday(routine.id) ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleMarkAsDone(routine)}
                          disabled={isCompletedToday(routine.id)}
                        >
                            {isCompletedToday(routine.id) ? 'Completed' : 'Mark as Done'}
                        </Button>
                    </CardFooter>
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
