
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoalCompletionChart, RoutineCompletionChart } from "@/components/dashboard-charts";
import { getCompletedGoals } from "../goals/actions";
import type { GoalCompletionLog } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";


export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("monthly");
  const [completedGoals, setCompletedGoals] = useState<GoalCompletionLog[]>([]);

  useEffect(() => {
    async function fetchCompletedGoals() {
      const goals = await getCompletedGoals();
      setCompletedGoals(goals);
    }
    fetchCompletedGoals();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-5xl space-y-8">
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
            <Select value={timeRange} onValueChange={setTimeRange}>
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
            <Tabs defaultValue="routines" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="routines">Routines</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>
              <TabsContent value="routines" className="mt-6">
                 <RoutineCompletionChart timeRange={timeRange} />
              </TabsContent>
              <TabsContent value="goals" className="mt-6">
                <GoalCompletionChart />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
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

        <div className="text-center">
            <Button asChild variant="ghost">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
