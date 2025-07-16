
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookHeart, PlusCircle, Home } from "lucide-react";
import type { JournalEntry } from "@/domain/entities";

// Mock Data
const mockEntries: JournalEntry[] = [
  {
    id: "1",
    userId: "user1",
    title: "A Day of Small Wins",
    content: "Today was a good day. I managed to finish my big project at work and even had time to go for a walk in the park. The weather was perfect. Feeling grateful for these small moments of peace.",
    imageUrl: "https://placehold.co/600x400.png",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    mood: "😊",
  },
  {
    id: "2",
    userId: "user1",
    title: "Reflections on a Book",
    content: "Finished reading 'The Midnight Library' and it left me with a lot to think about. The idea that we can live so many different lives is both daunting and comforting. It makes me want to be more intentional with my choices.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    mood: "🤔",
  },
];

export default function JournalListPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('bloom-journal');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
          return value;
        });
        setEntries(parsedEntries);
      } else {
        setEntries(mockEntries);
        localStorage.setItem('bloom-journal', JSON.stringify(mockEntries));
      }
    } catch (error) {
      console.error("Failed to load journal entries from localStorage", error);
      setEntries(mockEntries);
    }
  }, []);

  const sortedEntries = [...entries].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-screen">
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
                  Another....
              </Link>
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Past Thoughts</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[50vh]">
                    <div className="space-y-4">
                        {sortedEntries.map(entry => (
                            <Link href={`/journal/${entry.id}`} key={entry.id} className="block">
                                <div className="p-4 rounded-lg bg-background/50 hover:bg-primary/20 border border-border transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-primary truncate">{entry.title}</h3>
                                            <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="text-2xl">{entry.mood}</div>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate opacity-70 mt-2">{entry.content}</p>
                                </div>
                            </Link>
                        ))}
                         {sortedEntries.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">Your journal is empty. Write your first thought!</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
        
        <div className="text-center">
            <Button asChild variant="ghost">
                <Link href="/"><Home className="mr-2"/>Back to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
