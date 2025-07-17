
'use server';

import { revalidatePath } from 'next/cache';
import type { JournalEntry } from '@/domain/entities';
import { prisma } from '@/lib/db';

export async function getJournalEntries() {
  return prisma.journalEntry.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getJournalEntry(id: string) {
    return prisma.journalEntry.findUnique({
        where: { id }
    });
}

export async function saveJournalEntry(entry: Omit<JournalEntry, 'userId' | 'createdAt' | 'updatedAt'> & { id: string }) {
    const isNew = entry.id.startsWith('new-');
    const userId = 'user@example.com'; // In a real app, this would come from authentication

    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) {
        throw new Error("User not found");
    }

    const data = {
        title: entry.title,
        content: entry.content,
        mood: entry.mood === undefined ? null : entry.mood,
        imageUrl: entry.imageUrl,
        userId: user.id
    };

    let savedEntry;
    if (isNew) {
        savedEntry = await prisma.journalEntry.create({ data: {
            title: data.title,
            content: data.content,
            mood: data.mood,
            imageUrl: data.imageUrl,
            userId: data.userId
        } });
    } else {
        savedEntry = await prisma.journalEntry.update({
            where: { id: entry.id },
            data,
        });
    }

    revalidatePath('/journal');
    revalidatePath(`/journal/${savedEntry.id}`);

    return savedEntry;
}


export async function deleteJournalEntry(id: string) {
  await prisma.journalEntry.delete({
    where: { id },
  });
  revalidatePath('/journal');
}
