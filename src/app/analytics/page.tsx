import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoalCompletionChart } from "@/components/dashboard-charts";

export default function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Visualize your growth and track your progress over time.
          </p>
        </div>
        
        <GoalCompletionChart />
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>More Stats Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This section is under construction. Soon you'll be able to see
              even more detailed stats here!
            </p>
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
