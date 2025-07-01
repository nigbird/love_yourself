import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoalCompletionChart } from "@/components/dashboard-charts";
import { JournalPrompt } from "@/components/journal-prompt";
import {
  Target,
  BookHeart,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const goals = [
  { title: "Gain 8kg in 3 months", progress: 25, category: "Personal" },
  { title: "Read Bible book X in 1 week", progress: 80, category: "Spiritual" },
  { title: "Finish skincare course", progress: 50, category: "Personal" },
];

const journalEntries = [
  {
    id: 1,
    date: "July 20, 2024",
    excerpt: "Today was a really productive day. I managed to...",
  },
  {
    id: 2,
    date: "July 19, 2024",
    excerpt: "Felt a bit down, but I'm trying to focus on...",
  },
  {
    id: 3,
    date: "July 18, 2024",
    excerpt: "A small win today! I finally organized my...",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Welcome back, User!
          </h1>
          <p className="text-muted-foreground">
            Here's your self-care snapshot for today.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                +2 since last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Routines
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Journal Entries
              </CardTitle>
              <BookHeart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Total entries this month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <GoalCompletionChart />
          </div>
          <div className="lg:col-span-2">
            <JournalPrompt />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ongoing Goals</CardTitle>
              <CardDescription>
                Keep up the great work on your current goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.title}>
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-medium">{goal.title}</p>
                    <span className="text-sm text-muted-foreground">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress value={goal.progress} />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/goals">
                  View All Goals <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>
                A look back at your recent reflections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-medium">{entry.date}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {entry.excerpt}
                  </p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/journal">
                  Go to Journal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
