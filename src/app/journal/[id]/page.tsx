
'use client';

import { getJournalEntry, saveJournalEntry as saveEntryAction } from '../actions';
import { JournalEditor } from './editor';
import { PageLayout } from '@/components/layout/page-layout';
import { useAuth } from '@/components/auth/auth-provider';
import { useEffect, useState, useCallback } from 'react';
import type { JournalEntry } from '@/domain/entities';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';


export default function JournalEntryPage() {
  const pathname = usePathname();
  const entryId = pathname.split('/').pop() || '';
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getIdToken, user } = useAuth();
  
  // This memoization prevents the new entry from being recreated on every render
  const newEntryTemplate = useCallback(() => ({
      id: `new-${Date.now()}`,
      userId: user?.uid || 'temp-user',
      title: "New Thought",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      mood: "😊",
  }), [user?.uid]);

  // If this is a new entry, we create a placeholder immediately.
  if (entryId === 'new' && !entry) {
    setEntry(newEntryTemplate());
    setIsLoading(false);
  }

  useEffect(() => {
    // This effect is now only for fetching EXISTING entries.
    if (entryId === 'new' || !user) {
        if (entryId === 'new') setIsLoading(false);
        return;
    }

    async function loadExistingEntry() {
        setIsLoading(true);
        try {
            const token = await getIdToken();
            if (!token) {
                console.error("Could not get auth token.");
                setIsLoading(false);
                return;
            }
            const fetchedEntry = await getJournalEntry(token, entryId);
            setEntry(fetchedEntry);
        } catch (error) {
            console.error("Failed to fetch journal entry:", error);
        } finally {
            setIsLoading(false);
        }
    }
    
    loadExistingEntry();

  }, [entryId, user, getIdToken]); 
  
  const handleSave = async (entryToSave: JournalEntry) => {
    const token = await getIdToken();
    if (!token) {
        throw new Error("Authentication required");
    }
    const savedEntry = await saveEntryAction(token, entryToSave);
    // After saving, we update the local state with the final version from the server.
    // This is especially important for new entries to get the real ID.
    setEntry(savedEntry as JournalEntry);
    return savedEntry;
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="animate-spin h-8 w-8 text-primary"/>
            <p className="mt-4 text-muted-foreground">Loading entry...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBackButton={false}>
      <JournalEditor 
        entry={entry}
        onEntryChange={setEntry}
        onEntrySave={handleSave}
      />
    </PageLayout>
  );
}
