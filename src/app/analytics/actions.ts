
'use server';

import { prisma } from '@/lib/db';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, format, subDays } from 'date-fns';

type TimeRange = 'weekly' | 'monthly' | 'yearly';

export interface AnalyticsData {
  routineChartData: {
    date: string;
    completed: number;
    missed: number;
  }[];
  goalStatusChartData: {
    name: string;
    value: number;
    fill: string;
  }[];
  completedGoalsLog: {
    id: string;
    goalName: string;
    completedAt: Date;
    rewardPoints: number;
  }[];
}

export async function getAnalyticsData(timeRange: TimeRange): Promise<AnalyticsData> {
  const userId = 'clx14pve80000108u8b53d9ud'; // Hardcoded user for now

  // 1. Fetch data for Routine Chart
  const { startDate, endDate, formatString, interval } = getDateRange(timeRange);

  const routines = await prisma.routine.findMany({ where: { userId } });
  const routineLogs = await prisma.routineCompletionLog.findMany({
    where: { userId, completedAt: { gte: startDate, lte: endDate } },
    orderBy: { completedAt: 'asc' },
  });
  
  const routineDates = eachDayOfInterval({ start: startDate, end: endDate });
  const routineChartData = routineDates.map(date => {
    const formattedDate = format(date, formatString);
    let completedCount = 0;
    let expectedCount = 0;
    
    routines.forEach(routine => {
        const dayOfWeek = date.getDay();
        const isExpected = routine.frequency === 'daily' || (routine.frequency === 'weekly' && routine.daysOfWeek.includes(dayOfWeek));
        if (isExpected) {
            expectedCount++;
        }
    });

    const logsForDay = routineLogs.filter(log => format(log.completedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    completedCount = new Set(logsForDay.map(l => l.routineId)).size;
    
    return {
        date: formattedDate,
        completed: completedCount,
        missed: Math.max(0, expectedCount - completedCount),
    }
  });


  // 2. Fetch data for Goal Status Chart
  const goals = await prisma.goal.findMany({ where: { userId } });
  const completedGoalsCount = await prisma.goalCompletionLog.count({
      where: { userId, completedAt: { gte: startOfYear(new Date()), lte: endOfYear(new Date()) } }
  });

  const inProgressGoals = goals.filter(g => g.type === 'personal_measurable' && g.currentValue < g.targetValue && (!g.endDate || g.endDate > new Date())).length;
  const overdueGoals = goals.filter(g => g.endDate && g.endDate < new Date()).length;

  const goalStatusChartData = [
    { name: 'Completed', value: completedGoalsCount, fill: 'hsl(var(--chart-2))' },
    { name: 'In Progress', value: inProgressGoals, fill: 'hsl(var(--chart-1))' },
    { name: 'Overdue', value: overdueGoals, fill: 'hsl(var(--destructive))' },
  ];

  // 3. Fetch completed goals log
  const completedGoalsLog = await prisma.goalCompletionLog.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: 100, // Limit to last 100 for performance
  });

  return { 
    routineChartData, 
    goalStatusChartData,
    completedGoalsLog: completedGoalsLog.map(g => ({ id: g.id, goalName: g.goalName, completedAt: g.completedAt, rewardPoints: g.rewardPoints })),
  };
}

function getDateRange(timeRange: TimeRange) {
  const now = new Date();
  switch (timeRange) {
    case 'weekly':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
        formatString: 'EEE',
        interval: { days: 1 }
      };
    case 'monthly':
      return {
        startDate: startOfMonth(subDays(now, 29)),
        endDate: endOfMonth(now),
        formatString: 'MMM d',
        interval: { days: 1 }
      };
    case 'yearly':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
        formatString: 'MMM',
        interval: { months: 1 }
      };
  }
}
