
'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImagePlus, Save, Trash2, Wand2, Loader2, XCircle, ArrowLeft, SmilePlus } from "lucide-react";
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
import { getJournalEntry, saveJournalEntry, deleteJournalEntry } from '../actions';

const moods = ["😊", "😢", "😠", "😍", "🤔", "😴", "None"];

export default function JournalEntryPage() {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchEntry() {
      if (entryId === 'new') {
        setCurrentEntry({
          id: `new-${Date.now()}`,
          userId: 'user1',
          title: "New Thought",
          content: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          mood: "😊",
        });
      } else {
        const entry = await getJournalEntry(entryId);
        setCurrentEntry(entry as JournalEntry | null);
      }
    }
    fetchEntry();
  }, [entryId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentEntry?.content]);

  const handleUpdateEntry = (field: keyof JournalEntry, value: any) => {
    if (currentEntry) {
      if (field === 'mood' && value === 'None') {
        setCurrentEntry({ ...currentEntry, mood: undefined });
      } else {
        setCurrentEntry({ ...currentEntry, [field]: value });
      }
    }
  }

  const handleSaveEntry = async () => {
    if (!currentEntry || !currentEntry.title.trim() || !currentEntry.content.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please provide a title and some content for your entry.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    const isNew = currentEntry.id.startsWith('new-');

    try {
        const savedEntry = await saveJournalEntry(currentEntry);
        setCurrentEntry(savedEntry as JournalEntry);
        toast({ title: isNew ? "Entry Saved!" : "Entry Updated!", description: "Your journal has been updated." });
        if (isNew) {
            router.replace(`/journal/${savedEntry.id}`);
        }
    } catch (error) {
        console.error("Failed to save entry:", error);
        toast({ title: "Error Saving", description: "Could not save your entry.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteEntry = async () => {
      if (!currentEntry || currentEntry.id.startsWith('new-')) return;
      try {
        await deleteJournalEntry(currentEntry.id);
        toast({ title: "Entry Deleted", variant: 'destructive' });
        router.push('/journal');
      } catch (error) {
        console.error("Failed to delete entry:", error);
        toast({ title: "Error Deleting", description: "Could not delete your entry.", variant: "destructive" });
      }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentEntry) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateEntry('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (currentEntry) {
        handleUpdateEntry('imageUrl', undefined);
    }
  };

  const handleGenerateImage = async () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY && process.env.NODE_ENV !== 'development') {
        toast({
            title: "Feature Not Configured",
            description: "The AI image generation requires an API key.",
            variant: "destructive",
        });
        return;
    }
    if (!currentEntry || !currentEntry.content) {
      toast({ title: "Nothing to illustrate!", description: "Write something in your journal first.", variant: "destructive" });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const result = await generateImageFromText({ text: currentEntry.content });
      if (result.imageUrl) {
        handleUpdateEntry('imageUrl', result.imageUrl);
        toast({ title: "Illustration created!", description: "An image has been generated based on your entry." });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({ title: "Generation Failed", description: "Couldn't create an image right now. This can happen if the API key is missing or invalid.", variant: "destructive" });
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  if (!currentEntry) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin h-8 w-8 text-primary"/>
            <p className="mt-4 text-muted-foreground">Loading entry...</p>
             <Button asChild variant="link" className="mt-4">
                <Link href="/journal"><ArrowLeft className="mr-2"/>Back to Journal</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
         <div className="mb-6">
            <Button asChild variant="ghost">
                <Link href="/journal"><ArrowLeft className="mr-2"/>Back to Journal</Link>
            </Button>
        </div>
        
        <Card className="flex flex-col bg-[hsl(var(--paper))] text-paper-foreground shadow-2xl rounded-2xl min-h-[calc(100vh-12rem)]">
        <CardContent className="p-8 flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                <Input
                    placeholder="Title"
                    className="text-4xl font-bold h-auto bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 font-headline"
                    value={currentEntry.title}
                    onChange={(e) => handleUpdateEntry('title', e.target.value)}
                />
                <p className="text-sm text-paper-foreground/60">{new Date(currentEntry.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-3xl w-12 h-12">
                            {currentEntry.mood || <SmilePlus className="h-8 w-8 text-muted-foreground"/>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex gap-1 flex-wrap max-w-24">
                        {moods.map(mood => (
                            <Button key={mood} variant="ghost" size="icon" className="text-2xl" onClick={() => handleUpdateEntry('mood', mood)}>{mood === 'None' ? <XCircle className="h-6 w-6"/> : mood}</Button>
                        ))}
                        </div>
                    </PopoverContent>
                    </Popover>

                    <Button onClick={handleSaveEntry} size="sm" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                        Save
                    </Button>
                    {!currentEntry.id.startsWith('new-') && (
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
            
            <div className="flex-grow flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="bg-accent/20 border-accent/30 text-accent-foreground hover:bg-accent/30">
                        <ImagePlus className="mr-2"/> {currentEntry.imageUrl ? "Change Image" : "Add Image"}
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                    <Button onClick={handleGenerateImage} variant="outline" size="sm" className="bg-accent/20 border-accent/30 text-accent-foreground hover:bg-accent/30" disabled={isGeneratingImage}>
                    {isGeneratingImage ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                    Illustrate my thoughts
                    </Button>

                    {currentEntry.imageUrl && (
                        <Button onClick={handleRemoveImage} variant="destructive" size="icon" title="Remove Image">
                            <XCircle />
                        </Button>
                    )}
                </div>
                {currentEntry.imageUrl && (
                    <div className="aspect-video relative w-full rounded-lg overflow-hidden border border-paper-foreground/10">
                        <Image src={currentEntry.imageUrl} alt={currentEntry.title} layout="fill" objectFit="cover" data-ai-hint="journal memory" />
                    </div>
                )}

                <Textarea
                    ref={textareaRef}
                    placeholder="Start writing..."
                    className="flex-grow text-lg resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-body leading-relaxed overflow-hidden"
                    value={currentEntry.content}
                    onChange={(e) => handleUpdateEntry('content', e.target.value)}
                    style={{minHeight: '40vh'}}
                />
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
