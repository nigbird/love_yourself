
'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient, GoalType } from '@prisma/client';
import type { Goal, MeasurableGoal } from '@/domain/entities';

const prisma = new PrismaClient();

export async function getGoals() {
  return prisma.goal.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function saveGoal(goal: Omit<Goal | MeasurableGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = goal;
  const userId = 'user@example.com'; // In a real app, this would come from authentication

  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const goalData = {
    ...data,
    type: data.type as GoalType, // Explicitly cast the string to the enum type
    rewardPoints: Number(data.rewardPoints),
    targetValue: data.type === 'personal_measurable' ? Number(data.targetValue) : null,
    currentValue: data.type === 'personal_measurable' ? Number(data.currentValue) : null,
    unit: data.type === 'personal_measurable' ? data.unit : null,
    userId: user.id,
  };

  if (id) {
    await prisma.goal.update({
      where: { id },
      data: goalData,
    });
  } else {
    await prisma.goal.create({
      data: goalData,
    });
  }

  revalidatePath('/goals');
}


export async function deleteGoal(id: string) {
  await prisma.goal.delete({
    where: { id },
  });
  revalidatePath('/goals');
}
