import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JournalPrompt } from "@/components/journal-prompt";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function JournalPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen justify-center">
        <div className="w-full max-w-4xl space-y-8">
            <div className="space-y-4 text-center">
                <h1 className="text-3xl font-headline font-bold text-primary">Daily Journal</h1>
                <p className="text-muted-foreground">
                Reflect, vent, and celebrate your journey with daily journal entries.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>New Entry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="Start writing..." className="min-h-[300px] text-base"/>
                    <Button className="mt-4 w-full">Save Entry</Button>
                  </CardContent>
                </Card>
                 <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Past Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                        This section is under construction. Soon you'll be able to see your past journal entries here!
                        </p>
                    </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <JournalPrompt />
              </div>
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
