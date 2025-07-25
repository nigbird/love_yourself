
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
        if (entryId === 'new') {
            setEntry({
                id: `new-${Date.now()}`,
                userId: user?.uid || 'new-user', // This will be replaced on save by the server action
                title: "New Thought",
                content: "",
                createdAt: new Date(),
                updatedAt: new Date(),
                mood: "😊",
            });
            return;
        }

        const token = await getIdToken();
        if (!token) {
            // Handle not authenticated state if necessary
            return;
        }
        
        const fetchedEntry = await getJournalEntry(token, entryId);
        setEntry(fetchedEntry);
    }
    
    if(entryId){
      loadEntry();
    }

  }, [entryId, getIdToken, user]);

  return (
    <PageLayout showBackButton={false}>
      <JournalEditor initialEntry={entry} />
    </PageLayout>
  );
}
