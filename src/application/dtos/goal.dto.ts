// Data Transfer Objects for goals
// These are used to transfer data between layers, e.g., from the UI to the application layer.

import type { GoalType } from "@/domain/entities";

export interface CreateGoalDto {
  name: string;
  type: GoalType;
  rewardPoints: number;
  startDate?: Date;
  endDate?: Date;
  targetValue?: number;
  unit?: string;
}
