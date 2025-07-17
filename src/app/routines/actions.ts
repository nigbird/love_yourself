
'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient, RoutineFrequency } from '@prisma/client';
import type { Routine } from '@/domain/entities';

const prisma = new PrismaClient();

export async function getRoutines() {
  return prisma.routine.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function saveRoutine(routine: Omit<Routine, 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = routine;
  const userId = 'user@example.com'; // In a real app, this would come from authentication

  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const routineData = {
    ...data,
    frequency: data.frequency as RoutineFrequency, // Explicitly cast the string to the enum type
    rewardPoints: Number(data.rewardPoints),
    userId: user.id,
  };

  if (id) {
    await prisma.routine.update({
      where: { id },
      data: routineData,
    });
  } else {
    await prisma.routine.create({
      data: routineData,
    });
  }

  revalidatePath('/routines');
}


export async function deleteRoutine(id: string) {
  await prisma.routine.delete({
    where: { id },
  });
  revalidatePath('/routines');
}

export async function getCompletionStatus() {
  const logs = await prisma.routineCompletionLog.findMany({
    where: {
      // Filter for logs from today, for example
    },
  });

  const status: { [key: string]: string } = {};
  logs.forEach(log => {
    status[log.routineId] = log.completedAt.toISOString().split('T')[0];
  });
  return status;
}

export async function markRoutineAsDone(routineId: string) {
    const userId = 'user@example.com';
    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0,0,0,0);

    const existingLog = await prisma.routineCompletionLog.findFirst({
        where: {
            routineId: routineId,
            userId: user.id,
            completedAt: {
                gte: today
            }
        }
    });

    if (!existingLog) {
        await prisma.routineCompletionLog.create({
            data: {
                routineId: routineId,
                userId: user.id,
                completedAt: new Date(),
            }
        });
    }
  revalidatePath('/routines');
}
