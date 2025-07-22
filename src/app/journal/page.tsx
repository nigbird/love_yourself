
import { getJournalEntries } from './actions';
import type { JournalEntry } from "@/domain/entities";
import { JournalListClient } from '@/components/journal/journal-list-client';

export default async function JournalListPage() {
  const initialEntries = await getJournalEntries() as JournalEntry[];

  return (
    <JournalListClient initialEntries={initialEntries} />
  );
}
