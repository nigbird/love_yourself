
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Star, ShoppingCart, Trash2, Edit, MoreVertical } from 'lucide-react';
import { getPointsHistory, getRedeemableRewards, saveReward, redeemReward, deleteReward } from './actions';
import type { RedeemableReward } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateRewardForm from '@/components/rewards/create-reward-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


type PointsHistory = {
  date: string;
  items: {
    type: 'routine' | 'goal';
    name: string;
    points: number;
  }[];
};

export default function RewardsPage() {
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [rewards, setRewards] = useState<RedeemableReward[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RedeemableReward | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  const fetchData = async () => {
      const [pointsHistory, redeemableRewards] = await Promise.all([
          getPointsHistory(),
          getRedeemableRewards(),
      ]);
      setHistory(pointsHistory.history);
      setTotalPoints(pointsHistory.totalPoints);
      setRewards(redeemableRewards);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditingReward(null);
    setIsFormOpen(true);
  }

  const openEditForm = (reward: RedeemableReward) => {
    setEditingReward(reward);
    setIsFormOpen(true);
  }

  const handleFormSubmit = async (data: Omit<RedeemableReward, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
        const rewardData = editingReward ? { ...data, id: editingReward.id } : data;
        await saveReward(rewardData);
        toast({ title: editingReward ? "Reward Updated!" : "Reward Created!" });
        fetchData(); // Refetch all data
        setIsFormOpen(false);
        setEditingReward(null);
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not save reward.", variant: "destructive" });
    }
  };

  const handleRedeem = async (reward: RedeemableReward) => {
      if (totalPoints < reward.cost) {
          toast({ title: "Not enough points!", description: "Complete more routines and goals to earn points.", variant: "destructive" });
          return;
      }
      try {
        await redeemReward(reward);
        toast({ title: "Reward Redeemed!", description: `You've redeemed "${reward.title}"!` });
        fetchData(); // Refetch all data
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not redeem reward.", variant: "destructive" });
      }
  }

  const handleDelete = async (rewardId: string) => {
    try {
        await deleteReward(rewardId);
        toast({ title: "Reward Deleted", variant: "destructive" });
        fetchData();
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not delete reward.", variant: "destructive" });
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-5xl space-y-8">
        <div className="space-y-4 text-center">
            <h1 className="text-3xl font-headline font-bold text-primary">Rewards & Points</h1>
            <p className="text-muted-foreground">
                View your progress and redeem your hard-earned points.
            </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm text-center">
            <CardHeader>
                <CardTitle className="text-2xl text-accent">Your Total Points</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-5xl font-bold">{totalPoints}</p>
            </CardContent>
        </Card>

        <Tabs defaultValue="redeem" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
                <TabsTrigger value="history">Points History</TabsTrigger>
            </TabsList>

            <TabsContent value="redeem" className="mt-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Redeemable Rewards</CardTitle>
                        <Dialog open={isFormOpen} onOpenChange={(open) => { if(!open) setEditingReward(null); setIsFormOpen(open);}}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateForm}><PlusCircle className="mr-2"/>Add Reward</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingReward ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
                                </DialogHeader>
                                <CreateRewardForm onRewardSubmitted={handleFormSubmit} rewardToEdit={editingReward || undefined} />
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rewards.map(reward => (
                            <Card key={reward.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-primary">{reward.title}</CardTitle>
                                    <CardDescription>{reward.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow"></CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <Badge variant="secondary" className="text-lg">{reward.cost} pts</Badge>
                                    <div className="flex gap-1">
                                        <Button onClick={() => handleRedeem(reward)} size="sm" disabled={totalPoints < reward.cost}>
                                            <ShoppingCart className="mr-2"/>Redeem
                                        </Button>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => openEditForm(reward)}><Edit className="mr-2"/>Edit</DropdownMenuItem>
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
                                                            <AlertDialogDescription>This will permanently delete this reward.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(reward.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                         {rewards.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">You haven't added any rewards yet.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Your Points Journey</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ScrollArea className="h-96">
                            <div className="space-y-6">
                                {history.map(day => (
                                    <div key={day.date}>
                                        <h3 className="font-semibold text-lg mb-2 text-muted-foreground">{day.date}</h3>
                                        <div className="space-y-2 border-l-2 border-primary/20 pl-4 ml-2">
                                            {day.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                                                    <div>
                                                        <p className="font-semibold text-primary capitalize">{item.type}: {item.name}</p>
                                                    </div>
                                                    <Badge variant="secondary">+{item.points} pts</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && <p className="text-muted-foreground text-center py-10">No points earned yet. Go complete some routines!</p>}
                            </div>
                         </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
