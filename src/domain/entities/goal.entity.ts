
export type GoalType = 'personal_measurable' | 'spiritual';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  rewardPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeasurableGoal extends Goal {
  type: 'personal_measurable';
  startDate: Date | null;
  endDate: Date | null;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null; // e.g., 'kg', 'pages', 'minutes'
}

export interface SpiritualGoal extends Goal {
  type: 'spiritual';
}

export interface GoalCompletionLog {
  id: string;
  goalId: string;
  completedAt: Date;
  notes?: string;
  value?: number; // For measurable goals
}
