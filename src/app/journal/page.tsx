import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function JournalPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-headline font-bold">Daily Journal</h1>
        <p className="text-muted-foreground">
          Reflect, vent, and celebrate your journey with daily journal entries.
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This section is under construction. Soon you'll be able to manage
              your journal here!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
