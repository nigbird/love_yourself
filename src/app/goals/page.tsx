
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, MoreVertical, Edit, Trash2, CheckCircle } from "lucide-react";
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
import { getGoals, saveGoal, deleteGoal, completeGoal } from './actions';


export default function GoalsPage() {
  const [goals, setGoals] = useState<(Goal | MeasurableGoal)[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | MeasurableGoal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchGoals() {
      const dbGoals = await getGoals();
      setGoals(dbGoals as (Goal | MeasurableGoal)[]);
    }
    fetchGoals();
  }, []);


  const openCreateForm = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  }

  const openEditForm = (goal: Goal | MeasurableGoal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  }

  const handleFormSubmit = async (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    try {
        const goalData = editingGoal ? { ...data, id: editingGoal.id } : data;
        await saveGoal(goalData);
        
        const updatedGoals = await getGoals();
        setGoals(updatedGoals as (Goal | MeasurableGoal)[]);

        toast({ title: editingGoal ? "Goal Updated!" : "Goal Created!", description: `"${data.name}" has been saved.` });
        setIsFormOpen(false);
        setEditingGoal(null);
    } catch (error) {
        console.error("Failed to save goal", error);
        toast({ title: "Error", description: "Could not save the goal.", variant: "destructive" });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
        await deleteGoal(goalId);
        setGoals(goals.filter(g => g.id !== goalId));
        toast({ title: "Goal Deleted", variant: 'destructive' });
    } catch (error) {
        console.error("Failed to delete goal", error);
        toast({ title: "Error", description: "Could not delete the goal.", variant: "destructive" });
    }
  }

  const handleCompleteGoal = async (goal: Goal | MeasurableGoal) => {
    try {
        await completeGoal(goal);
        setGoals(goals.filter(g => g.id !== goal.id));
        toast({ title: "Goal Completed!", description: `Congratulations on achieving "${goal.name}"! You've earned ${goal.rewardPoints} points.` });
    } catch (error) {
        console.error("Failed to complete goal", error);
        toast({ title: "Error", description: "Could not complete the goal.", variant: "destructive" });
    }
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
                        {goal.type === 'personal_measurable' && 'currentValue' in goal && 'targetValue' in goal && (goal as MeasurableGoal).targetValue > 0 && (
                            <div className="space-y-2">
                                <Progress value={((goal as MeasurableGoal).currentValue / (goal as MeasurableGoal).targetValue) * 100} />
                                <p className="text-sm text-muted-foreground text-right">{(goal as MeasurableGoal).currentValue} / {(goal as MeasurableGoal).targetValue} {(goal as MeasurableGoal).unit}</p>
                            </div>
                        )}
                        {goal.type === 'spiritual' && (
                             <p className="text-sm text-muted-foreground">A journey of faith and reflection.</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <p className="text-accent font-bold">{goal.rewardPoints}pts</p>
                        <Button variant="outline" size="sm" onClick={() => handleCompleteGoal(goal)}>
                            <CheckCircle className="mr-2" />
                            Complete
                        </Button>
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
