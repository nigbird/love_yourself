
import { getJournalEntry } from '../actions';
import { JournalEditor } from './editor';

export default async function JournalEntryPage({ params }: { params: { id: string } }) {
  const entryId = params.id;
  let entry;

  if (entryId === 'new') {
    entry = {
      id: `new-${Date.now()}`,
      userId: 'user1',
      title: "New Thought",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      mood: "😊",
    };
  } else {
    entry = await getJournalEntry(entryId);
  }

  return <JournalEditor initialEntry={entry} />;
}
