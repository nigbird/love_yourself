export type RoutineFrequency = 'daily' | 'weekly' | 'monthly';

export interface Routine {
  id: string;
  userId: string;
  name: string;
  frequency: RoutineFrequency;
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
