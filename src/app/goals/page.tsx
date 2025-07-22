
import { getGoals } from './actions';
import type { Goal, MeasurableGoal } from "@/domain/entities";
import { GoalsClient } from '@/components/goals/goals-client';

export default async function GoalsPage() {
  const initialGoals = await getGoals() as (Goal | MeasurableGoal)[];

  return <GoalsClient initialGoals={initialGoals} />;
}
