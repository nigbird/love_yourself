
'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PanelLeftClose, PanelLeftOpen, BookHeart, Trash2, Home, ImagePlus, Save, XCircle, Wand2, Loader2 } from "lucide-react";
import Image from "next/image";
import type { JournalEntry } from "@/domain/entities";
import { useToast } from "@/hooks/use-toast";
import { generateImageFromText } from "@/ai/flows/image-generator";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

const moods = ["😊", "😢", "😠", "😍", "🤔", "😴"];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const sortedEntries = [...parsedEntries].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
          setSelectedEntry(sortedEntries[0]);
        } else {
           handleNewEntry();
        }
      } else {
        setEntries(mockEntries);
        setSelectedEntry(mockEntries[0]);
      }
    } catch (error) {
      console.error("Failed to load journal entries from localStorage", error);
      setEntries(mockEntries);
      setSelectedEntry(mockEntries[0]);
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
      mood: "😊",
    };
    setEntries(prev => [newEntry, ...prev]);
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
    let entryToSave = { ...selectedEntry, updatedAt: new Date() };

    if (isNew) {
      entryToSave.id = new Date().toISOString(); 
    }
    
    const newEntries = entries.map(e => e.id === selectedEntry.id || (isNew && e.id === `new-${selectedEntry.id.split('-')[1]}`) ? entryToSave : e);
    setEntries(newEntries);
    setSelectedEntry(entryToSave);
    
    toast({ title: isNew ? "Entry Saved!" : "Entry Updated!", description: "Your journal has been updated." });
  };

  const handleDeleteEntry = () => {
      if (!selectedEntry || selectedEntry.id.startsWith('new-')) return;
      setEntries(entries.filter(e => e.id !== selectedEntry.id));
      const remainingEntries = entries.filter(e => e.id !== selectedEntry.id);
      if (remainingEntries.length > 0) {
        const sorted = [...remainingEntries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setSelectedEntry(sorted[0]);
      } else {
        setSelectedEntry(null);
      }
      toast({ title: "Entry Deleted", variant: 'destructive' });
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedEntry) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedEntry({ ...selectedEntry, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (selectedEntry) {
        const { imageUrl, ...rest } = selectedEntry;
        setSelectedEntry(rest as JournalEntry);
    }
  };

  const handleUpdateSelectedEntry = (field: keyof JournalEntry, value: any) => {
    if (selectedEntry) {
      setSelectedEntry({ ...selectedEntry, [field]: value });
    }
  }

  const handleGenerateImage = async () => {
    if (!selectedEntry || !selectedEntry.content) {
      toast({ title: "Nothing to illustrate!", description: "Write something in your journal first.", variant: "destructive" });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const result = await generateImageFromText({ text: selectedEntry.content });
      if (result.imageUrl) {
        setSelectedEntry({ ...selectedEntry, imageUrl: result.imageUrl });
        toast({ title: "Illustration created!", description: "An image has been generated based on your entry." });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({ title: "Generation Failed", description: "Couldn't create an image right now. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingImage(false);
    }
  };


  const sortedEntries = [...entries].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full gap-6">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-1/3 min-w-[300px]' : 'w-16'} flex flex-col`}>
        <div className="flex flex-col flex-1 bg-transparent">
          <div className="flex flex-row items-center justify-between p-2 mb-4">
             {isSidebarOpen && <h2 className="text-primary text-2xl font-headline flex items-center gap-2"><BookHeart/> My Journal</h2>}
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
          </div>
          
          <Button onClick={handleNewEntry} className="mb-4 mx-2">
              Another....
          </Button>
          
          <ScrollArea className="flex-1">
             <div className="p-2 space-y-2">
                {sortedEntries.map(entry => (
                  <button
                    key={entry.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors relative ${selectedEntry?.id === entry.id ? 'bg-primary/20 border-primary/50' : 'bg-card/50 hover:bg-card/80'} border`}
                    onClick={() => handleSelectEntry(entry)}
                  >
                     {isSidebarOpen ? (
                        <>
                          <div className="font-bold text-primary truncate">{entry.title}</div>
                          <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-xs text-muted-foreground truncate opacity-70 mt-1">{entry.content}</p>
                          <div className="absolute top-2 right-2 text-2xl">{entry.mood}</div>
                        </>
                     ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{entry.mood}</span>
                          <BookHeart className="h-5 w-5 mt-1 text-primary"/>
                        </div>
                     )}
                  </button>
                ))}
             </div>
          </ScrollArea>
           <div className="p-2 mt-auto">
                <Button asChild variant="ghost" className="w-full">
                    <Link href="/"><Home className="mr-2"/>Back to Home</Link>
                </Button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col group/content">
        {selectedEntry ? (
          <Card className="flex-1 flex flex-col bg-[hsl(var(--paper))] text-paper-foreground shadow-2xl rounded-2xl">
            <CardContent className="p-8 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Input
                        placeholder="Title"
                        className="text-4xl font-bold h-auto bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 font-headline"
                        value={selectedEntry.title}
                        onChange={(e) => handleUpdateSelectedEntry('title', e.target.value)}
                    />
                    <p className="text-sm text-paper-foreground/60">{new Date(selectedEntry.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-3xl w-12 h-12">{selectedEntry.mood}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="flex gap-2">
                            {moods.map(mood => (
                              <Button key={mood} variant="ghost" size="icon" className="text-2xl" onClick={() => handleUpdateSelectedEntry('mood', mood)}>{mood}</Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Button onClick={handleSaveEntry} size="sm"><Save className="mr-2"/>Save</Button>
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
                </div>
                <Separator className="bg-paper-foreground/20"/>
                
                <div className="flex-1 flex flex-col gap-4">
                   <div className="flex items-center gap-2">
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="bg-accent/20 border-accent/30 text-accent-foreground hover:bg-accent/30">
                          <ImagePlus className="mr-2"/> {selectedEntry.imageUrl ? "Change Image" : "Add Image"}
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                      <Button onClick={handleGenerateImage} variant="outline" size="sm" className="bg-accent/20 border-accent/30 text-accent-foreground hover:bg-accent/30" disabled={isGeneratingImage}>
                        {isGeneratingImage ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                        Illustrate my thoughts
                      </Button>

                      {selectedEntry.imageUrl && (
                          <Button onClick={handleRemoveImage} variant="destructive" size="icon" title="Remove Image">
                              <XCircle />
                          </Button>
                      )}
                    </div>
                    {selectedEntry.imageUrl && (
                        <div className="aspect-video relative w-full rounded-lg overflow-hidden border border-paper-foreground/10">
                            <Image src={selectedEntry.imageUrl} alt={selectedEntry.title} layout="fill" objectFit="cover" data-ai-hint="journal memory" />
                        </div>
                    )}

                    <Textarea
                        placeholder="Start writing..."
                        className="flex-1 text-lg resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-body leading-relaxed"
                        value={selectedEntry.content}
                        onChange={(e) => handleUpdateSelectedEntry('content', e.target.value)}
                    />
                </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center bg-card/50">
              <CardContent>
                <h2 className="text-2xl font-headline text-primary">Your diary is waiting.</h2>
                <p className="text-muted-foreground mt-2">Select an entry or create a new one to begin.</p>
                <Button onClick={handleNewEntry} className="mt-6">Create First Entry</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
