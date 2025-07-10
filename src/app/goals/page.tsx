import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GoalsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen justify-center text-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-4">
            <h1 className="text-3xl font-headline font-bold text-primary">
            Personal & Spiritual Goals
            </h1>
            <p className="text-muted-foreground">
            Set, track, and achieve your goals for personal growth and spiritual
            development.
            </p>
        </div>
        <Card className="bg-card/50 backdrop-blur-sm">
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
        <Button asChild variant="ghost">
            <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
