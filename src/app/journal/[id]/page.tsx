
'use client';

import { getJournalEntry } from '../actions';
import { JournalEditor } from './editor';
import { PageLayout } from '@/components/layout/page-layout';
import { useAuth } from '@/components/auth/auth-provider';
import { useEffect, useState } from 'react';
import type { JournalEntry } from '@/domain/entities';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';


export default function JournalEntryPage() {
  const pathname = usePathname();
  const entryId = pathname.split('/').pop() || '';
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getIdToken, user } = useAuth();
  
  // If this is a new entry, we create a placeholder immediately.
  // This avoids waiting for useEffect and makes the editor appear instantly.
  if (entryId === 'new' && !entry) {
    const newEntry: JournalEntry = {
        id: `new-${Date.now()}`,
        userId: user?.uid || 'temp-user',
        title: "New Thought",
        content: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        mood: "😊",
    };
    setEntry(newEntry);
    setIsLoading(false);
  }

  useEffect(() => {
    // This effect is now only for fetching EXISTING entries.
    if (entryId === 'new') {
        setIsLoading(false);
        return;
    }

    async function loadExistingEntry() {
        if (!user) {
            // Wait for the user object to be available.
            return;
        }
        
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
    
    setIsLoading(true);
    loadExistingEntry();

  }, [entryId, user, getIdToken]); 

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
      <JournalEditor initialEntry={entry} />
    </PageLayout>
  );
}
