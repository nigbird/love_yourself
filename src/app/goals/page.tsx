
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import type { Goal, MeasurableGoal } from "@/domain/entities";
import { CreateGoalForm } from "@/components/goals/create-goal-form";

// Mock Data - In a real app, this would come from a database.
const mockGoals: (Goal | MeasurableGoal)[] = [
  {
    id: "1",
    name: "Gain 8kg in 3 months",
    type: "personal_measurable",
    targetValue: 8,
    currentValue: 2,
    unit: "kg",
    rewardPoints: 200,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Read the Book of John",
    type: "spiritual",
    rewardPoints: 100,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Meditate 15 mins daily for a month",
    type: "personal_measurable",
    targetValue: 30,
    currentValue: 10,
    unit: "days",
    rewardPoints: 150,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];


export default function GoalsPage() {
  const [goals, setGoals] = useState<(Goal | MeasurableGoal)[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | MeasurableGoal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem('bloom-goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals, (key, value) => {
             if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
             return value;
        }));
      } else {
        setGoals(mockGoals); // Initialize with mock data if nothing is saved
      }
    } catch (error) {
        console.error("Failed to load goals from localStorage", error);
        setGoals(mockGoals); // Fallback to mock data on error
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
        if(goals.length > 0) localStorage.setItem('bloom-goals', JSON.stringify(goals));
    } catch (error) {
        console.error("Failed to save goals to localStorage", error);
    }
  }, [goals]);


  const openCreateForm = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  }

  const openEditForm = (goal: Goal | MeasurableGoal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      // Edit existing goal
      const updatedGoals = goals.map(g => g.id === editingGoal.id ? { ...g, ...data, updatedAt: new Date() } : g);
      setGoals(updatedGoals);
      toast({ title: "Goal Updated!", description: `"${data.name}" has been saved.` });
    } else {
      // Create new goal
      const newGoal: Goal | MeasurableGoal = {
        id: new Date().toISOString(),
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      setGoals([newGoal, ...goals]);
      toast({ title: "Goal Created!", description: `"${data.name}" has been added.` });
    }
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    toast({ title: "Goal Deleted", variant: 'destructive' });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
            <h1 className="text-3xl font-headline font-bold text-primary">
            Personal & Spiritual Goals
            </h1>
            <p className="text-muted-foreground">
            Set, track, and achieve your goals for personal growth and spiritual
            development.
            </p>
        </div>

        <div className="text-center">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                  <Button onClick={openCreateForm} size="lg">
                      <PlusCircle className="mr-2" />
                      Create New Goal
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] bg-background/95 backdrop-blur-sm">
                  <DialogHeader>
                      <DialogTitle className="text-primary text-2xl">{editingGoal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
                  </DialogHeader>
                  <CreateGoalForm
                    onGoalSubmitted={handleFormSubmit} 
                    goalToEdit={editingGoal || undefined}
                  />
              </DialogContent>
            </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {goals.map((goal) => (
                <Card key={goal.id} className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <CardTitle className="text-xl text-primary flex items-center gap-2">
                            <Target />
                            {goal.name}
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditForm(goal)}>
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
                                            This action cannot be undone. This will permanently delete this goal.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        {goal.type === 'personal_measurable' && 'currentValue' in goal && 'targetValue' in goal && (
                            <div className="space-y-2">
                                <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                                <p className="text-sm text-muted-foreground text-right">{goal.currentValue} / {goal.targetValue} {goal.unit}</p>
                            </div>
                        )}
                        {goal.type === 'spiritual' && (
                             <p className="text-sm text-muted-foreground">A journey of faith and reflection.</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <p className="text-accent font-bold">{goal.rewardPoints}pts</p>
                        <Button variant="outline" size="sm" disabled>Log Progress</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>

        <div className="text-center">
            <Button asChild variant="ghost">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
