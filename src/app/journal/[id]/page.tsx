
'use client';

import { getJournalEntry } from '../actions';
import { JournalEditor } from './editor';
import { PageLayout } from '@/components/layout/page-layout';
import { useAuth } from '@/components/auth/auth-provider';
import { useEffect, useState } from 'react';
import type { JournalEntry } from '@/domain/entities';
import { usePathname } from 'next/navigation';


export default function JournalEntryPage() {
  const pathname = usePathname();
  const entryId = pathname.split('/').pop() || '';
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const { getIdToken, user } = useAuth();
  
  useEffect(() => {
    // If this is a new entry, create a placeholder immediately.
    // This makes the editor appear instantly for a new post.
    if (entryId === 'new') {
        setEntry({
            id: `new-${Date.now()}`,
            userId: user?.uid || 'temp-user', // Use a temporary ID; real one is set on save.
            title: "New Thought",
            content: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            mood: "😊",
        });
        return; // Stop here for new entries.
    }

    // For existing entries, we need to fetch the data.
    async function loadExistingEntry() {
        if (!user) {
            // We need to wait for the user to be available to get the token.
            // If the user is not yet available, this effect will re-run when it is.
            return;
        }
        
        try {
            const token = await getIdToken();
            if (!token) {
                console.error("Could not get auth token.");
                // Optionally set an error state here.
                return;
            }
            const fetchedEntry = await getJournalEntry(token, entryId);
            setEntry(fetchedEntry);
        } catch (error) {
            console.error("Failed to fetch journal entry:", error);
            // Optionally set an error state here.
        }
    }
    
    loadExistingEntry();

  }, [entryId, getIdToken, user]); // Depend on `user` to re-run when auth state is resolved.

  return (
    <PageLayout showBackButton={false}>
      <JournalEditor initialEntry={entry} />
    </PageLayout>
  );
}
