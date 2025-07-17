
'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import type { Wish } from '@/domain/entities';

const prisma = new PrismaClient();

export async function getWishes() {
  return prisma.wish.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function saveWish(wish: Omit<Wish, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = wish;
  const userId = 'user@example.com'; // In a real app, this would come from authentication

  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const wishData = {
    ...data,
    userId: user.id,
  };

  if (id) {
    await prisma.wish.update({
      where: { id },
      data: wishData,
    });
  } else {
    await prisma.wish.create({
      data: wishData,
    });
  }

  revalidatePath('/wish');
}


export async function deleteWish(id: string) {
  await prisma.wish.delete({
    where: { id },
  });
  revalidatePath('/wish');
}

export async function fulfillWish(wish: Wish) {
  const userId = 'user@example.com';
  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user) {
    throw new Error("User not found");
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
    where: { id: wish.id },
  });

  revalidatePath('/wish');
  revalidatePath('/analytics');
}

export async function getFulfilledWishes() {
    const userId = 'user@example.com';
    const user = await prisma.user.findUnique({ where: { email: userId } });
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
