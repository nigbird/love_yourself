import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RoutinesPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-headline font-bold">Self-Care Routines</h1>
        <p className="text-muted-foreground">
          Plan and track your self-care activities to build healthy habits.
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This section is under construction. Soon you'll be able to manage
              your routines here!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
