
'use server';

import { revalidatePath } from 'next/cache';
import type { Routine } from '@/domain/entities';
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

export async function getRoutines() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return [];
  }
  const routines = await prisma.routine.findMany({
    where: { userId: user.id },
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
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const routineData = {
    ...data,
    daysOfWeek: data.daysOfWeek?.join(',') || '',
    rewardPoints: Number(data.rewardPoints),
    userId: user.id,
  };

  if (id) {
    await prisma.routine.update({
      where: { id, userId: user.id },
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
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  await prisma.routine.delete({
    where: { id, userId: user.id },
  });
  revalidatePath('/routines');
}

export async function getCompletionStatus() {
  const user = await getAuthenticatedUser();
  if (!user) return {};

  const logs = await prisma.routineCompletionLog.findMany({
    where: { userId: user.id },
  });

  const status: { [key: string]: string } = {};
  logs.forEach(log => {
    status[log.routineId] = log.completedAt.toISOString().split('T')[0];
  });
  return status;
}

export async function markRoutineAsDone(routine: Routine) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not authenticated");

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
  revalidatePath('/'); // Revalidate root layout for points update
}

export async function undoCompletion(routineId: string) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not authenticated");

    const today = new Date();
    today.setHours(0,0,0,0);

    const logToDelete = await prisma.routineCompletionLog.findFirst({
        where: {
            routineId: routineId,
            userId: user.id,
            completedAt: {
                gte: today
            }
        }
    });
    
    if (logToDelete) {
        // Decrease user's points
        await prisma.user.update({
            where: { id: user.id },
            data: {
                rewardPoints: {
                    decrement: logToDelete.rewardPoints
                }
            }
        });

        // Delete the log
        await prisma.routineCompletionLog.delete({
            where: { id: logToDelete.id }
        });

        revalidatePath('/routines');
        revalidatePath('/analytics');
        revalidatePath('/'); // Revalidate root layout for points update
    }
}
