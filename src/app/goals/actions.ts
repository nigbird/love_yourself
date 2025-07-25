
'use server';

import { revalidatePath } from 'next/cache';
import type { Goal, MeasurableGoal } from '@/domain/entities';
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

export async function getGoals() {
  const user = await getAuthenticatedUser();
  if (!user) return [];
  return prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function saveGoal(goal: Omit<Goal | MeasurableGoal, 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = goal;
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const goalData = {
    ...data,
    type: data.type as string,
    rewardPoints: Number(data.rewardPoints),
    targetValue: data.type === 'personal_measurable' ? Number(data.targetValue) : null,
    currentValue: data.type === 'personal_measurable' ? Number(data.currentValue) : null,
    unit: data.type === 'personal_measurable' ? data.unit : null,
    userId: user.id,
  };

  if (id) {
    await prisma.goal.update({
      where: { id, userId: user.id },
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
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User not authenticated");
  await prisma.goal.delete({
    where: { id, userId: user.id },
  });
  revalidatePath('/goals');
}

export async function completeGoal(goal: Goal | MeasurableGoal) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User not authenticated");

  await prisma.$transaction(async (tx) => {
    // 1. Create a log entry for the completed goal
    await tx.goalCompletionLog.create({
      data: {
        goalId: goal.id,
        userId: user.id,
        goalName: goal.name,
        goalType: goal.type,
        rewardPoints: goal.rewardPoints,
        completedAt: new Date(),
      }
    });

    // 2. Add reward points to the user
    await tx.user.update({
      where: { id: user.id },
      data: {
        rewardPoints: {
          increment: goal.rewardPoints
        }
      }
    });

    // 3. Delete the original goal
    await tx.goal.delete({
      where: { id: goal.id, userId: user.id },
    });
  });

  revalidatePath('/goals');
  revalidatePath('/analytics');
  revalidatePath('/'); // Revalidate root layout for points update
}

export async function getCompletedGoals() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return [];
    }

    return prisma.goalCompletionLog.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            completedAt: 'desc',
        }
    });
}
