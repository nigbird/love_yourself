
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { startOfToday } from 'date-fns';
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

async function getAuthenticatedUser(idToken: string) {
    if (!idToken) {
        return null;
    }
    
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

export async function getUnreadNotifications(idToken: string) {
    const user = await getAuthenticatedUser(idToken);
    if (!user) return { notifications: [], count: 0 };

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id, read: false },
        orderBy: { createdAt: 'desc' },
    });
    const count = await prisma.notification.count({
        where: { userId: user.id, read: false },
    });
    return { notifications, count };
}

export async function markAllNotificationsAsRead(idToken: string) {
    const user = await getAuthenticatedUser(idToken);
    if (!user) return;
    await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
    });
    revalidatePath('/'); // Revalidate all pages to update notification count
}

export async function createReminderNotification(routineId: string) {
    const routine = await prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine) throw new Error("Routine not found");

    await prisma.notification.create({
        data: {
            userId: routine.userId,
            message: `It's time for your "${routine.name}" routine!`,
            url: '/routines'
        }
    });

    revalidatePath('/');
}

// This function is used by the reminder provider to get necessary routine data efficiently
export async function getRoutinesForReminders(idToken: string) {
    const user = await getAuthenticatedUser(idToken);
    if (!user) return [];
    
    const today = startOfToday();
    
    const routines = await prisma.routine.findMany({
        where: { userId: user.id, remindersEnabled: true },
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
            userId: user.id,
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
