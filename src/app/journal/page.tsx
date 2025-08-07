
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookHeart, PlusCircle, Home, Loader2 } from "lucide-react";
import type { JournalEntry } from "@/domain/entities";
import { getJournalEntries } from './actions';
import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/components/auth/auth-provider";


export default function JournalListPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getIdToken } = useAuth();

  useEffect(() => {
    async function fetchEntries() {
      setIsLoading(true);
      const token = await getIdToken();
      if (!token) {
        setEntries([]);
        setIsLoading(false);
        return;
      }
      try {
        const dbEntries = await getJournalEntries(token);
        setEntries(dbEntries as JournalEntry[]);
      } catch (error) {
        console.error("Failed to fetch journal entries:", error);
        // Optionally, show a toast notification here
      } finally {
        setIsLoading(false);
      }
    }
    fetchEntries();
  }, [getIdToken]);

  return (
    <PageLayout>
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center justify-center gap-2">
                <BookHeart/> My Journal
            </h1>
            <p className="text-muted-foreground">
                A collection of your thoughts, reflections, and memories.
            </p>
        </div>

        <div className="text-center">
          <Button asChild size="lg">
              <Link href="/journal/new">
                  <PlusCircle className="mr-2" />
                  Create New Entry
              </Link>
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Past Thoughts</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[50vh]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[50vh]">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {entries.length > 0 ? (
                                entries.map(entry => (
                                    <Link href={`/journal/${entry.id}`} key={entry.id} className="block">
                                        <div className="p-4 rounded-lg bg-background/50 hover:bg-primary/20 border border-border transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">{entry.mood}</div>
                                                    <div>
                                                        <h3 className="font-bold text-primary truncate">{entry.title}</h3>
                                                        <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate opacity-70 mt-2">{entry.content}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Your journal is empty. Write your first thought!</p>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
        
        <div className="text-center">
            <Button asChild variant="ghost">
                <a href="/"><Home className="mr-2"/>Back to Home</a>
            </Button>
        </div>
      </div>
    </PageLayout>
  );
}
