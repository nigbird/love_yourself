
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateRoutineForm } from "@/components/routines/create-routine-form";
import { PlusCircle, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Routine } from '@/domain/entities';

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

export default function RoutinesPage() {
  const [open, setOpen] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>(mockRoutines);

  const handleRoutineCreated = (newRoutine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const routineToAdd: Routine = {
        id: (routines.length + 1).toString(),
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...newRoutine
    };
    setRoutines(prev => [...prev, routineToAdd]);
    setOpen(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">Self-Care Routines</h1>
          <p className="text-muted-foreground">
            Plan, track, and build healthy habits for a blooming life.
          </p>
        </div>

        <div className="flex justify-center">
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                        <PlusCircle className="mr-2"/>
                        Create New Routine
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] bg-background/95 backdrop-blur-sm">
                    <DialogHeader>
                    <DialogTitle className="text-primary text-2xl">New Self-Care Routine</DialogTitle>
                    </DialogHeader>
                    <CreateRoutineForm onRoutineCreated={handleRoutineCreated} />
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {routines.map(routine => (
                <Card key={routine.id} className="bg-card/50 backdrop-blur-sm border-white/10 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">{routine.name}</CardTitle>
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
                        <Button variant="outline" size="sm">Mark as Done</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>

      </div>
    </div>
  );
}
