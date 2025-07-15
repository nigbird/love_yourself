export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
