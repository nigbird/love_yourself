
import { PageLayout } from "@/components/layout/page-layout";
import { getCompletedGoals } from "../goals/actions";
import { getFulfilledWishes } from "../wish/actions";
import { getAnalyticsData } from './actions';
import { AnalyticsClient } from "./client";

export default async function AnalyticsPage() {
  const timeRange = "monthly";
  const [goals, wishes, analytics] = await Promise.all([
    getCompletedGoals(),
    getFulfilledWishes(),
    getAnalyticsData(timeRange)
  ]);

  return (
    <PageLayout>
      <div className="w-full max-w-5xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">
            Your Progress Analytics
          </h1>
          <p className="text-muted-foreground">
            Visualize your growth and track your progress over time.
          </p>
        </div>
        <AnalyticsClient
          initialCompletedGoals={goals}
          initialFulfilledWishes={wishes}
          initialAnalytics={analytics}
          initialTimeRange={timeRange}
        />
      </div>
    </PageLayout>
  );
}
