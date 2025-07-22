
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { startOfToday } from 'date-fns';

const getUserId = async () => {
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } });
    if (!user) throw new Error("User not found");
    return user.id;
}

export async function getUnreadNotifications() {
    const userId = await getUserId();
    const notifications = await prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
    });
    const count = await prisma.notification.count({
        where: { userId, read: false },
    });
    return { notifications, count };
}

export async function markAllNotificationsAsRead() {
    const userId = await getUserId();
    await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });
    revalidatePath('/'); // Revalidate all pages to update notification count
}

export async function createReminderNotification(routineId: string) {
    const routine = await prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine) throw new Error("Routine not found");

    const message = `It's time for your "${routine.name}" routine!`;

    await prisma.notification.create({
        data: {
            userId: routine.userId,
            message: message,
            url: '/routines'
        }
    });

    revalidatePath('/');
}

// This function is used by the reminder provider to get necessary routine data efficiently
export async function getRoutinesForReminders() {
    const userId = await getUserId();
    const today = startOfToday();
    
    const routines = await prisma.routine.findMany({
        where: { userId: userId, remindersEnabled: true },
        select: {
            id: true,
            name: true,
            frequency: true,
            daysOfWeek: true,
            timeOfDay: true,
            remindersEnabled: true,
        }
    });

    const completionLogs = await prisma.routineCompletionLog.findMany({
        where: {
            userId: userId,
            routineId: {
                in: routines.map(r => r.id)
            },
            completedAt: {
                gte: today
            }
        },
        select: {
            routineId: true
        }
    });

    const completedRoutineIds = new Set(completionLogs.map(log => log.routineId));
    
    return routines.map(routine => ({
        ...routine,
        isCompletedToday: completedRoutineIds.has(routine.id)
    }));
}
