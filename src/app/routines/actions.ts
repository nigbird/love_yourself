
'use server';

import { revalidatePath } from 'next/cache';
import type { Routine } from '@/domain/entities';
import { prisma } from '@/lib/db';

export async function getRoutines() {
  const routines = await prisma.routine.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return routines.map(routine => ({
      ...routine,
      daysOfWeek: typeof routine.daysOfWeek === 'string' 
          ? routine.daysOfWeek.split(',').map(Number) 
          : [],
  }));
}

export async function saveRoutine(routine: Omit<Routine, 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = routine;
  const userId = 'user@example.com'; 

  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const routineData = {
    ...data,
    daysOfWeek: data.daysOfWeek?.join(',') || '',
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
      // For simplicity, fetching all logs. In a real app, you might filter by date.
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

         // Add reward points to the user
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
