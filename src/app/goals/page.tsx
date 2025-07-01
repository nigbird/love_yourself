import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function GoalsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-headline font-bold">
          Personal & Spiritual Goals
        </h1>
        <p className="text-muted-foreground">
          Set, track, and achieve your goals for personal growth and spiritual
          development.
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This section is under construction. Soon you'll be able to manage
              your goals here!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
