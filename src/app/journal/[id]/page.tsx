
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
    async function loadEntry() {
        if (!entryId) return;

        // For a new entry, create a temporary object immediately without waiting.
        // This makes the editor appear instantly. The real userId will be attached on save.
        if (entryId === 'new') {
            setEntry({
                id: `new-${Date.now()}`,
                userId: user?.uid || 'temp-user', // Use a temporary ID
                title: "New Thought",
                content: "",
                createdAt: new Date(),
                updatedAt: new Date(),
                mood: "😊",
            });
            return;
        }

        // For an existing entry, we must wait for the token to fetch it.
        const token = await getIdToken();
        if (!token) {
            // Not logged in, can't fetch an existing entry.
            // Maybe redirect or show an error. For now, we'll just stop.
            return;
        }
        
        const fetchedEntry = await getJournalEntry(token, entryId);
        setEntry(fetchedEntry);
    }
    
    loadEntry();

  }, [entryId, getIdToken, user]);

  return (
    <PageLayout showBackButton={false}>
      <JournalEditor initialEntry={entry} />
    </PageLayout>
  );
}
