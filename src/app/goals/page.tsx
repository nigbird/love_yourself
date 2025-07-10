import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target } from "lucide-react";
import Link from "next/link";

// Mock Data - In a real app, this would come from a database.
const goals = [
  {
    id: "1",
    name: "Gain 8kg in 3 months",
    type: "personal_measurable",
    targetValue: 8,
    currentValue: 2,
    unit: "kg",
    rewardPoints: 200,
  },
  {
    id: "2",
    name: "Read the Book of John",
    type: "spiritual",
    rewardPoints: 100,
  },
  {
    id: "3",
    name: "Meditate 15 mins daily for a month",
    type: "personal_measurable",
    targetValue: 30,
    currentValue: 10,
    unit: "days",
    rewardPoints: 150,
  },
];


export default function GoalsPage() {
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
            <Button size="lg" disabled>
                <PlusCircle className="mr-2" />
                Create New Goal (Coming Soon)
            </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {goals.map((goal) => (
                <Card key={goal.id} className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center gap-2">
                            <Target />
                            {goal.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {goal.type === 'personal_measurable' && (
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
