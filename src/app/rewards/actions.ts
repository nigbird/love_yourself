
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { RedeemableReward } from '@prisma/client';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const getUserId = async () => {
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } });
    if (!user) throw new Error("User not found");
    return user.id;
}

export async function getUserRewardPoints() {
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } });
    if (!user) throw new Error("User not found");
    return user.rewardPoints;
}


export async function getPointsHistory() {
    const userId = await getUserId();
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if (!user) throw new Error("User not found");

    const routineLogs = await prisma.routineCompletionLog.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
    });

    const goalLogs = await prisma.goalCompletionLog.findMany({
        where: { userId },
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
    const userId = await getUserId();
    return prisma.redeemableReward.findMany({
        where: { userId },
        orderBy: { cost: 'asc' },
    });
}

export async function saveReward(reward: Omit<RedeemableReward, 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { id, ...data } = reward;
  const userId = await getUserId();
  
  const rewardData = {
    ...data,
    cost: Number(data.cost),
    userId,
  };

  if (id) {
    await prisma.redeemableReward.update({
      where: { id },
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
    await prisma.redeemableReward.delete({
        where: { id },
    });
    revalidatePath('/rewards');
}

export async function redeemReward(reward: RedeemableReward) {
    const userId = await getUserId();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.rewardPoints < reward.cost) {
        throw new Error("Not enough points");
    }

    await prisma.$transaction(async (tx) => {
        // Decrement user points
        await tx.user.update({
            where: { id: userId },
            data: { rewardPoints: { decrement: reward.cost } },
        });

        // Create redemption log
        await tx.rewardRedemptionLog.create({
            data: {
                userId,
                rewardId: reward.id,
                rewardTitle: reward.title,
                pointsSpent: reward.cost,
            },
        });
    });
    
    revalidatePath('/rewards');
    revalidatePath('/'); // Revalidate root layout for points update
}
