
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PanelLeftClose, PanelLeftOpen, BookHeart, Trash2, Home } from "lucide-react";
import Image from "next/image";
import type { JournalEntry } from "@/domain/entities";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { JournalPrompt } from "@/components/journal-prompt";

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
  },
  {
    id: "2",
    userId: "user1",
    title: "Reflections on a Book",
    content: "Finished reading 'The Midnight Library' and it left me with a lot to think about. The idea that we can live so many different lives is both daunting and comforting. It makes me want to be more intentional with my choices.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
];


export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('bloom-journal');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
          return value;
        });
        setEntries(parsedEntries);
        if (parsedEntries.length > 0) {
          // Select the most recent entry by default
          const sortedEntries = [...parsedEntries].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
          setSelectedEntry(sortedEntries[0]);
        } else {
           handleNewEntry();
        }
      } else {
        setEntries(mockEntries);
        setSelectedEntry(mockEntries[1]);
      }
    } catch (error) {
      console.error("Failed to load journal entries from localStorage", error);
      setEntries(mockEntries);
      setSelectedEntry(mockEntries[1]);
    }
  }, []);

  useEffect(() => {
    try {
        if(entries.length > 0) localStorage.setItem('bloom-journal', JSON.stringify(entries));
    } catch (error) {
        console.error("Failed to save journal entries to localStorage", error);
    }
  }, [entries]);

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleNewEntry = () => {
    const newEntry: JournalEntry = {
      id: `new-${Date.now()}`,
      userId: 'user1',
      title: "New Entry",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSelectedEntry(newEntry);
  };

  const handleSaveEntry = () => {
    if (!selectedEntry || !selectedEntry.title.trim() || !selectedEntry.content.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please provide a title and some content for your entry.",
        variant: "destructive",
      });
      return;
    }

    const isNew = selectedEntry.id.startsWith('new-');
    const entryToSave = { ...selectedEntry, updatedAt: new Date() };

    if (isNew) {
      entryToSave.id = new Date().toISOString(); // Assign a permanent ID
      setEntries([entryToSave, ...entries]);
      toast({ title: "Entry Saved!", description: "Your new journal entry has been saved." });
    } else {
      setEntries(entries.map(e => e.id === selectedEntry.id ? entryToSave : e));
      toast({ title: "Entry Updated!", description: "Your changes have been saved." });
    }
    setSelectedEntry(entryToSave); // Ensure the selected entry has the permanent ID
  };

  const handleDeleteEntry = () => {
      if (!selectedEntry || selectedEntry.id.startsWith('new-')) return;
      setEntries(entries.filter(e => e.id !== selectedEntry.id));
      setSelectedEntry(null);
      handleNewEntry();
      toast({ title: "Entry Deleted", variant: 'destructive' });
  };
  
  const sortedEntries = [...entries].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="flex h-[calc(100vh-10rem)] w-full">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-1/3 min-w-[300px]' : 'w-16'} flex flex-col`}>
        <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4">
             {isSidebarOpen && <CardTitle className="text-primary text-xl flex items-center gap-2"><BookHeart/> Journal Entries</CardTitle>}
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-1">
             <CardContent className="p-2">
                {sortedEntries.map(entry => (
                  <Button
                    key={entry.id}
                    variant={selectedEntry?.id === entry.id ? 'secondary' : 'ghost'}
                    className={`w-full justify-start mb-1 h-auto py-2 px-3 ${!isSidebarOpen && 'justify-center'}`}
                    onClick={() => handleSelectEntry(entry)}
                  >
                     {isSidebarOpen ? (
                        <div className="flex flex-col items-start text-left">
                            <span className="font-semibold">{entry.title}</span>
                            <span className="text-xs text-muted-foreground">{entry.createdAt.toLocaleDateString()}</span>
                        </div>
                     ) : (
                        <BookHeart className="h-5 w-5"/>
                     )}
                  </Button>
                ))}
             </CardContent>
          </ScrollArea>
           <Separator/>
            <div className="p-2">
                <Button onClick={handleNewEntry} className="w-full">
                    New Entry
                </Button>
            </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-6">
        {selectedEntry ? (
          <div className="flex flex-col h-full gap-4">
             <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <Input
                      placeholder="Entry Title"
                      className="text-2xl font-bold h-12 flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={selectedEntry.title}
                      onChange={(e) => setSelectedEntry({ ...selectedEntry, title: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleSaveEntry}>Save Entry</Button>
                        {!selectedEntry.id.startsWith('new-') && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon"><Trash2/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this journal entry.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteEntry}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </CardContent>
             </Card>
            <div className="flex-1 grid grid-cols-3 gap-6">
                <div className="col-span-3 lg:col-span-2 flex flex-col gap-4">
                   <Textarea
                        placeholder="Start writing..."
                        className="flex-1 text-base resize-none"
                        value={selectedEntry.content}
                        onChange={(e) => setSelectedEntry({ ...selectedEntry, content: e.target.value })}
                    />
                     <Input
                        placeholder="Image URL (optional)"
                        className="bg-card/80"
                        value={selectedEntry.imageUrl || ''}
                        onChange={(e) => setSelectedEntry({ ...selectedEntry, imageUrl: e.target.value })}
                    />
                </div>
                <div className="col-span-3 lg:col-span-1 flex flex-col gap-6">
                     {selectedEntry.imageUrl && (
                        <div className="aspect-video relative w-full rounded-lg overflow-hidden border">
                            <Image src={selectedEntry.imageUrl} alt={selectedEntry.title} layout="fill" objectFit="cover" data-ai-hint="journal memory" />
                        </div>
                     )}
                     <JournalPrompt />
                </div>
            </div>
             <div className="text-center">
                <Button asChild variant="ghost">
                    <Link href="/"><Home className="mr-2"/>Back to Home</Link>
                </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center bg-card/50">
              <CardTitle>Select an entry or create a new one</CardTitle>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
