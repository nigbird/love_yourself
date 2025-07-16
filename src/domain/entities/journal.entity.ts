export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrl?: string;
  mood?: string;
  createdAt: Date;
  updatedAt: Date;
}
