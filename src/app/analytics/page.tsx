
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trophy, Gift, ArrowLeft } from "lucide-react";
import type { WishFulfillmentLog } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { getFulfilledWishes } from "../wish/actions";
import { GoalStatusChart, RoutineCompletionChart } from "@/components/dashboard-charts";
import { getAnalyticsData, type AnalyticsData } from "./actions";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>("monthly");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [fulfilledWishes, setFulfilledWishes] = useState<WishFulfillmentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [data, wishes] = await Promise.all([
        getAnalyticsData(timeRange),
        getFulfilledWishes()
      ]);
      setAnalyticsData(data);
      setFulfilledWishes(wishes);
      setIsLoading(false);
    }
    fetchData();
  }, [timeRange]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-6xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">
            Your Progress Analytics
          </h1>
          <p className="text-muted-foreground">
            Visualize your growth and track your progress over time.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Dashboard</CardTitle>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as 'weekly' | 'monthly' | 'yearly')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : analyticsData ? (
                 <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Routine Completion</CardTitle>
                            <CardDescription>Your routine consistency for the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RoutineCompletionChart data={analyticsData.routineChartData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Goal Status</CardTitle>
                            <CardDescription>A snapshot of your current goals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GoalStatusChart data={analyticsData.goalStatusChartData} />
                        </CardContent>
                    </Card>
                 </div>
            ) : (
                <p className="text-center text-muted-foreground h-96 flex items-center justify-center">No analytics data available.</p>
            )}
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="text-accent"/>
                        Completed Goals Log
                    </CardTitle>
                    <CardDescription>A log of your amazing achievements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                    {analyticsData?.completedGoalsLog && analyticsData.completedGoalsLog.length > 0 ? (
                        analyticsData.completedGoalsLog.map(goal => (
                        <div key={goal.id} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                            <div>
                            <p className="font-semibold text-primary">{goal.goalName}</p>
                            <p className="text-xs text-muted-foreground">{new Date(goal.completedAt).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="secondary">+{goal.rewardPoints}pts</Badge>
                        </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">You haven't completed any goals yet. Keep going!</p>
                    )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="text-sky-300"/>
                        Fulfilled Wishes
                    </CardTitle>
                    <CardDescription>Dreams that you have turned into reality.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                    {fulfilledWishes.length > 0 ? (
                        fulfilledWishes.map(wish => (
                        <div key={wish.id} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                            <div>
                            <p className="font-semibold text-sky-300">{wish.wishTitle}</p>
                            <p className="text-xs text-muted-foreground">{new Date(wish.fulfilledAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No wishes fulfilled yet. Make a wish!</p>
                    )}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="text-center">
            <Button asChild variant="ghost">
                <Link href="/"><ArrowLeft className="mr-2"/>Back to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
