
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
