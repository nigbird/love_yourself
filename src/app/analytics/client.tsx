
'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoalCompletionChart, RoutineCompletionChart } from "@/components/dashboard-charts";
import type { GoalCompletionLog, WishFulfillmentLog } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Loader2 } from "lucide-react";
import { getAnalyticsData } from './actions';

type ChartData = { name: string; completed: number; tooltip: string; }[];
type AnalyticsData = { routines: ChartData; goals: ChartData };

interface AnalyticsClientProps {
    initialCompletedGoals: GoalCompletionLog[];
    initialFulfilledWishes: WishFulfillmentLog[];
    initialAnalytics: AnalyticsData;
    initialTimeRange: "weekly" | "monthly" | "yearly";
}

export function AnalyticsClient({
    initialCompletedGoals,
    initialFulfilledWishes,
    initialAnalytics,
    initialTimeRange
}: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "yearly">(initialTimeRange);
  const [completedGoals, setCompletedGoals] = useState<GoalCompletionLog[]>(initialCompletedGoals);
  const [fulfilledWishes, setFulfilledWishes] = useState<WishFulfillmentLog[]>(initialFulfilledWishes);
  const [chartData, setChartData] = useState<AnalyticsData | null>(initialAnalytics);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const analytics = await getAnalyticsData(timeRange);
      setChartData(analytics);
      setIsLoading(false);
    }
    // Only fetch if time range is different from the initial one
    if (timeRange !== initialTimeRange) {
        fetchData();
    }
  }, [timeRange, initialTimeRange]);

  return (
    <>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Completions Dashboard</CardTitle>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "weekly" | "monthly" | "yearly")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading || !chartData ? (
                <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Tabs defaultValue="routines" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="routines">Routines</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>
                <TabsContent value="routines" className="mt-6">
                    <RoutineCompletionChart data={chartData.routines} />
                </TabsContent>
                <TabsContent value="goals" className="mt-6">
                    <GoalCompletionChart data={chartData.goals} />
                </TabsContent>
                </Tabs>
            )}
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Trophy className="text-accent"/>
                    Completed Goals
                    </CardTitle>
                    <CardDescription>A log of your amazing achievements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                    {completedGoals.length > 0 ? (
                        completedGoals.map(goal => (
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
      </>
  );
}
