
'use server';

import { prisma } from '@/lib/db';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from 'date-fns';

type TimeRange = 'weekly' | 'monthly' | 'yearly';

const getUserId = async () => {
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } });
    if (!user) throw new Error("User not found");
    return user.id;
}

export const getAnalyticsData = async (timeRange: TimeRange) => {
    const userId = await getUserId();
    const now = new Date();
    
    let startDate: Date;
    let endDate: Date = now;

    switch(timeRange) {
        case 'weekly':
            startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
            endDate = endOfWeek(now, { weekStartsOn: 1 });
            break;
        case 'monthly':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        case 'yearly':
            startDate = startOfYear(now);
            endDate = endOfYear(now);
            break;
        default:
            startDate = subDays(now, 30);
    }
    
    const [routineLogs, goalLogs] = await Promise.all([
        prisma.routineCompletionLog.findMany({
            where: {
                userId,
                completedAt: { gte: startDate, lte: endDate }
            },
            orderBy: { completedAt: 'asc' }
        }),
        prisma.goalCompletionLog.findMany({
            where: {
                userId,
                completedAt: { gte: startDate, lte: endDate }
            },
            orderBy: { completedAt: 'asc' }
        })
    ]);

    const formatRoutineData = () => {
        let data: { name: string; completed: number; tooltip: string[] }[] | { name: string; completed: number; tooltip: string[], start: Date, end: Date }[] = [];
        if (timeRange === 'weekly') {
            const days = eachDayOfInterval({ start: startDate, end: endDate });
            data = days.map(day => ({
                name: format(day, 'EEE'),
                completed: 0,
                tooltip: []
            }));
            routineLogs.forEach(log => {
                const dayIndex = data.findIndex(d => d.name === format(log.completedAt, 'EEE'));
                if (dayIndex !== -1) {
                    (data[dayIndex] as any).completed++;
                    (data[dayIndex] as any).tooltip.push(`${log.routineName} (+${log.rewardPoints}pts)`);
                }
            });
        } else if (timeRange === 'monthly') {
            const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
             data = weeks.map((week, i) => ({
                name: `Week ${i + 1}`,
                completed: 0,
                tooltip: [],
                start: week,
                end: endOfWeek(week, { weekStartsOn: 1 })
            }));
             routineLogs.forEach(log => {
                const weekIndex = (data as {start: Date, end: Date}[]).findIndex(w => log.completedAt >= w.start && log.completedAt <= w.end);
                if (weekIndex !== -1) {
                    (data[weekIndex] as any).completed++;
                    (data[weekIndex] as any).tooltip.push(`${log.routineName} (+${log.rewardPoints}pts) on ${format(log.completedAt, 'MMM d')}`);
                }
            });
        } else { // yearly
            const months = eachMonthOfInterval({ start: startDate, end: endDate });
            data = months.map(month => ({
                name: format(month, 'MMM'),
                completed: 0,
                tooltip: []
            }));
            routineLogs.forEach(log => {
                const monthIndex = data.findIndex(m => m.name === format(log.completedAt, 'MMM'));
                if (monthIndex !== -1) {
                    (data[monthIndex] as any).completed++;
                    (data[monthIndex] as any).tooltip.push(`${log.routineName} (+${log.rewardPoints}pts)`);
                }
            });
        }
        return data.map(d => ({ ...d, tooltip: d.tooltip.join('\n') || "No completions" }));
    };

    const formatGoalData = () => {
        const dataMap = new Map<string, { name: string; completed: number; tooltip: string[] }>();
         goalLogs.forEach(log => {
            const key = format(log.completedAt, 'yyyy-MM-dd');
            if(!dataMap.has(key)) {
                dataMap.set(key, { name: format(log.completedAt, 'MMM d'), completed: 0, tooltip: [] });
            }
            const dayData = dataMap.get(key)!;
            dayData.completed++;
            dayData.tooltip.push(`${log.goalName} (+${log.rewardPoints}pts)`);
        });

        const data = Array.from(dataMap.values());
        return data.map(d => ({ ...d, tooltip: d.tooltip.join('\n') || "No completions" }));
    };

    return {
        routines: formatRoutineData(),
        goals: formatGoalData(),
    };
};
