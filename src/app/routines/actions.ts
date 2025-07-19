
'use server';

import { revalidatePath } from 'next/cache';
import type { Routine } from '@/domain/entities';
import { prisma } from '@/lib/db';

export async function getRoutines() {
  const routinesFromDb = await prisma.routine.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Parse daysOfWeek from string to number array
  return routinesFromDb.map(r => ({
      ...r,
      daysOfWeek: r.daysOfWeek ? r.daysOfWeek.split(',').map(Number) : [],
  }));
}

export async function saveRoutine(routine: Omit<Routine, 'userId' | 'createdAt' | 'updatedAt' | 'daysOfWeek'> & { id?: string; daysOfWeek?: number[] }) {
  const { id, ...data } = routine;
  const userId = 'user@example.com'; // In a real app, this would come from authentication

  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const routineData = {
    ...data,
    daysOfWeek: data.daysOfWeek ? data.daysOfWeek.join(',') : '',
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

export async function markRoutineAsDone(routine: Routine) {
    const userId = 'user@example.com';
    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0,0,0,0);

    const existingLog = await prisma.routineCompletionLog.findFirst({
        where: {
            routineId: routine.id,
            userId: user.id,
            completedAt: {
                gte: today
            }
        }
    });

    if (!existingLog) {
        await prisma.routineCompletionLog.create({
            data: {
                routineId: routine.id,
                userId: user.id,
                routineName: routine.name,
                rewardPoints: routine.rewardPoints,
                completedAt: new Date(),
            }
        });

         // Optionally, add reward points to the user
        await prisma.user.update({
            where: { id: user.id },
            data: {
            rewardPoints: {
                increment: routine.rewardPoints
            }
            }
        });
    }
  revalidatePath('/routines');
  revalidatePath('/analytics');
}
