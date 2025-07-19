
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
import type { Routine as RoutineEntity } from '@/domain/entities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getRoutines, saveRoutine, deleteRoutine, markRoutineAsDone, getCompletionStatus } from './actions';

const weekDays = [
    { label: 'S', value: '0' },
    { label: 'M', value: '1' },
    { label: 'T', value: '2' },
    { label: 'W', value: '3' },
    { label: 'T', value: '4' },
    { label: 'F', value: '5' },
    { label: 'S', value: '6' },
];

type CompletionStatus = {
    [routineId: string]: string; // Store date string 'YYYY-MM-DD'
};

type Routine = Omit<RoutineEntity, 'daysOfWeek'> & { daysOfWeek: number[] };

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({});
  
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
        const [dbRoutines, dbStatus] = await Promise.all([
            getRoutines(),
            getCompletionStatus()
        ]);
        setRoutines(dbRoutines as Routine[]);
        setCompletionStatus(dbStatus);
    }
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditingRoutine(null);
    setIsFormOpen(true);
  }

  const openEditForm = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsFormOpen(true);
  }

  const handleFormSubmit = async (data: Omit<RoutineEntity, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'daysOfWeek'> & { id?: string; daysOfWeek?: number[] }) => {
    try {
        const routineData = editingRoutine ? { ...data, id: editingRoutine.id } : data;
        await saveRoutine(routineData);

        const updatedRoutines = await getRoutines();
        setRoutines(updatedRoutines as Routine[]);
        
        toast({ title: editingRoutine ? "Routine Updated!" : "Routine Created!", description: `"${data.name}" has been saved.` });
        setIsFormOpen(false);
        setEditingRoutine(null);
    } catch (error) {
        console.error("Failed to save routine:", error);
        toast({ title: "Error", description: "Could not save the routine.", variant: "destructive" });
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    try {
        await deleteRoutine(routineId);
        setRoutines(routines.filter(r => r.id !== routineId));
        toast({ title: "Routine Deleted", variant: 'destructive' });
    } catch (error) {
        console.error("Failed to delete routine:", error);
        toast({ title: "Error", description: "Could not delete the routine.", variant: "destructive" });
    }
  }

  const handleMarkAsDone = async (routine: Routine) => {
    try {
        await markRoutineAsDone(routine);
        const today = new Date().toISOString().split('T')[0];
        setCompletionStatus(prev => ({ ...prev, [routine.id]: today }));
        toast({
          title: "Routine Complete!",
          description: `Great job on "${routine.name}"! You've earned ${routine.rewardPoints} points.`,
        });
    } catch (error) {
        console.error("Failed to mark as done:", error);
        toast({ title: "Error", description: "Could not complete the routine.", variant: "destructive" });
    }
  }

  const isCompletedToday = (routineId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return completionStatus[routineId] === today;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const completedTodayRoutines = routines.filter(r => completionStatus[r.id] === today);
  const totalPoints = completedTodayRoutines.reduce((sum, r) => sum + r.rewardPoints, 0);

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
            <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-primary">
                        <Star />
                        Today's Points
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-4xl font-bold text-accent">{totalPoints}</p>
                    <CardDescription>Total points earned today.</CardDescription>
                     <div className="mt-4 space-y-2 text-sm">
                        {completedTodayRoutines.length > 0 ? (
                            completedTodayRoutines.map(r => (
                                <div key={r.id} className="flex justify-between items-center bg-background/50 p-2 rounded-md">
                                    <span className="text-foreground/80">{r.name}</span>
                                    <span className="font-bold text-accent">+{r.rewardPoints}pts</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No routines completed yet today.</p>
                        )}
                    </div>
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
                                    <Edit className="mr-2 h-4 w-4"/>
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            <span>Delete</span>
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this routine.
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
                    <CardContent className="flex-grow space-y-4">
                        <div className="text-sm text-muted-foreground space-y-2">
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="capitalize">{routine.frequency}</Badge>
                             {routine.timeOfDay && <Badge variant="secondary">{routine.timeOfDay}</Badge>}
                           </div>
                            {routine.frequency === 'weekly' && routine.daysOfWeek && routine.daysOfWeek.length > 0 && (
                                <div className="flex gap-1.5">
                                    {weekDays.map((day, index) => (
                                        <span key={index} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${routine.daysOfWeek?.includes(index) ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                                            {day.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                         <p className="text-accent font-bold text-lg">{routine.rewardPoints}pts</p>
                    </CardContent>
                    <CardFooter>
                         <Button 
                            onClick={() => handleMarkAsDone(routine)} 
                            disabled={isCompletedToday(routine.id)}
                            className="w-full"
                        >
                            <Zap className="mr-2"/>
                            {isCompletedToday(routine.id) ? 'Completed Today!' : 'Mark as Done'}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>

        <div className="text-center">
            <Button asChild variant="ghost">
                <Link href="/"><Home className="mr-2"/>Back to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
