
'use server';

import { revalidatePath } from 'next/cache';
import type { Wish } from '@/domain/entities';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

async function getAuthenticatedUser(idToken: string) {
    if (!idToken) {
        return null;
    }
    
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

export async function getWishes(idToken: string) {
  const user = await getAuthenticatedUser(idToken);
  if (!user) return [];
  return prisma.wish.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function saveWish(idToken: string, wish: Omit<Wish, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = wish;
  const user = await getAuthenticatedUser(idToken);
  if (!user) {
    throw new Error("User not authenticated");
  }

  const wishData = {
    ...data,
    userId: user.id,
  };

  if (id) {
    await prisma.wish.update({
      where: { id, userId: user.id },
      data: wishData,
    });
  } else {
    await prisma.wish.create({
      data: wishData,
    });
  }

  revalidatePath('/wish');
}


export async function deleteWish(idToken: string, id: string) {
  const user = await getAuthenticatedUser(idToken);
  if (!user) throw new Error("User not authenticated");
  await prisma.wish.delete({
    where: { id, userId: user.id },
  });
  revalidatePath('/wish');
}

export async function fulfillWish(idToken: string, wish: Wish) {
  const user = await getAuthenticatedUser(idToken);
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Create a log entry for the fulfilled wish
  await prisma.wishFulfillmentLog.create({
    data: {
      wishId: wish.id,
      userId: user.id,
      wishTitle: wish.title,
      wishNote: wish.note,
      imageUrl: wish.imageUrl,
      fulfilledAt: new Date(),
    }
  });

  // Delete the original wish
  await prisma.wish.delete({
    where: { id: wish.id, userId: user.id },
  });

  revalidatePath('/wish');
  revalidatePath('/analytics');
}

export async function getFulfilledWishes(idToken: string) {
    const user = await getAuthenticatedUser(idToken);
    if (!user) {
        return [];
    }

    return prisma.wishFulfillmentLog.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            fulfilledAt: 'desc',
        }
    });
}
