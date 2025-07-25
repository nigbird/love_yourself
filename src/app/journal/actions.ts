
'use server';

import { revalidatePath } from 'next/cache';
import type { JournalEntry } from '@/domain/entities';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

async function getAuthenticatedUser() {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }
    const idToken = authorization.split('Bearer ')[1];
    
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.uid },
        });
        return user;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}

export async function getJournalEntries() {
  const user = await getAuthenticatedUser();
  if (!user) return [];
  return prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getJournalEntry(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) return null;
    return prisma.journalEntry.findUnique({
        where: { id, userId: user.id }
    });
}

export async function saveJournalEntry(entry: Omit<JournalEntry, 'userId' | 'createdAt' | 'updatedAt'> & { id: string }) {
    const isNew = entry.id.startsWith('new-');
    const user = await getAuthenticatedUser();
    if (!user) {
        throw new Error("User not authenticated");
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
            where: { id: entry.id, userId: user.id },
            data,
        });
    }

    revalidatePath('/journal');
    revalidatePath(`/journal/${savedEntry.id}`);

    return savedEntry;
}


export async function deleteJournalEntry(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User not authenticated");
  await prisma.journalEntry.delete({
    where: { id, userId: user.id },
  });
  revalidatePath('/journal');
}
