
import { getRoutines, getCompletionStatus } from './actions';
import type { Routine } from '@/domain/entities';
import { RoutinesClient } from '@/components/routines/routines-client';

export default async function RoutinesPage() {
  const [initialRoutines, initialCompletionStatus] = await Promise.all([
      getRoutines(),
      getCompletionStatus()
  ]);

  return (
    <RoutinesClient 
      initialRoutines={initialRoutines as Routine[]}
      initialCompletionStatus={initialCompletionStatus} 
    />
  );
}
