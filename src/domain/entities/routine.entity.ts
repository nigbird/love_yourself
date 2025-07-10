
export type RoutineFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Routine {
  id: string;
  userId: string;
  name: string;
  frequency: RoutineFrequency;
  daysOfWeek?: number[]; // 0 for Sunday, 6 for Saturday. Only for weekly/custom.
  timeOfDay?: string; // e.g., '08:00'
  remindersEnabled: boolean;
  rewardPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineCompletionLog {
  id: string;
  routineId: string;
  completedAt: Date;
  notes?: string;
}
