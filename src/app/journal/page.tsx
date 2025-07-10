import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function JournalPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
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
        </div>
    </div>
  );
}
