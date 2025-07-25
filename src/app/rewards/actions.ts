
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { RedeemableReward } from '@prisma/client';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
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

export async function getUserRewardPoints() {
    const user = await getAuthenticatedUser();
    if (!user) return 0;
    return user.rewardPoints;
}


export async function getPointsHistory() {
    const user = await getAuthenticatedUser();
    if (!user) return { totalPoints: 0, history: [] };

    const routineLogs = await prisma.routineCompletionLog.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: 'desc' },
    });

    const goalLogs = await prisma.goalCompletionLog.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: 'desc' },
    });

    const allLogs = [
        ...routineLogs.map(log => ({ ...log, type: 'routine' as const, name: log.routineName, date: log.completedAt })),
        ...goalLogs.map(log => ({ ...log, type: 'goal' as const, name: log.goalName, date: log.completedAt })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const groupedByDate = allLogs.reduce((acc, log) => {
        const dateKey = format(log.date, 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push({ type: log.type, name: log.name, points: log.rewardPoints });
        return acc;
    }, {} as Record<string, { type: 'routine' | 'goal', name: string, points: number }[]>);
    
    const history = Object.entries(groupedByDate).map(([date, items]) => {
        let displayDate: string;
        const parsedDate = parseISO(date);
        if (isToday(parsedDate)) {
            displayDate = "Today";
        } else if (isYesterday(parsedDate)) {
            displayDate = "Yesterday";
        } else {
            displayDate = format(parsedDate, "EEEE, MMMM d");
        }
        return {
            date: displayDate,
            items,
        };
    });

    return {
        totalPoints: user.rewardPoints,
        history,
    };
}


export async function getRedeemableRewards() {
    const user = await getAuthenticatedUser();
    if (!user) return [];
    return prisma.redeemableReward.findMany({
        where: { userId: user.id },
        orderBy: { cost: 'asc' },
    });
}

export async function saveReward(reward: Omit<RedeemableReward, 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = reward;
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User not authenticated");
  
  const rewardData = {
    ...data,
    cost: Number(data.cost),
    userId: user.id,
  };

  if (id) {
    await prisma.redeemableReward.update({
      where: { id, userId: user.id },
      data: rewardData,
    });
  } else {
    await prisma.redeemableReward.create({
      data: rewardData,
    });
  }

  revalidatePath('/rewards');
}

export async function deleteReward(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not authenticated");
    await prisma.redeemableReward.delete({
        where: { id, userId: user.id },
    });
    revalidatePath('/rewards');
}

export async function redeemReward(reward: RedeemableReward) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not authenticated");

    if (user.rewardPoints < reward.cost) {
        throw new Error("Not enough points");
    }

    await prisma.$transaction(async (tx) => {
        // Decrement user points
        await tx.user.update({
            where: { id: user.id },
            data: { rewardPoints: { decrement: reward.cost } },
        });

        // Create redemption log
        await tx.rewardRedemptionLog.create({
            data: {
                userId: user.id,
                rewardId: reward.id,
                rewardTitle: reward.title,
                pointsSpent: reward.cost,
            },
        });
    });
    
    revalidatePath('/rewards');
    revalidatePath('/'); // Revalidate root layout for points update
}
