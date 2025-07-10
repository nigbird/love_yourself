import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RoutinesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="space-y-4 text-center">
            <h1 className="text-3xl font-headline font-bold">Self-Care Routines</h1>
            <p className="text-muted-foreground">
            Plan and track your self-care activities to build healthy habits.
            </p>
        </div>
        <Card className="mt-8">
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
    </div>
  );
}
