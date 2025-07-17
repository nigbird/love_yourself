
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MeasurableGoal } from '@/domain/entities';
import { useEffect } from 'react';

const formSchema = z.object({
  currentValue: z.coerce.number().min(0, 'Progress cannot be negative.'),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateGoalProgressFormProps {
  onProgressSubmitted: (data: FormValues) => void;
  goalToEdit: MeasurableGoal;
}

export function UpdateGoalProgressForm({ onProgressSubmitted, goalToEdit }: UpdateGoalProgressFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentValue: 0,
    },
  });

  useEffect(() => {
    if (goalToEdit) {
      reset({
        currentValue: goalToEdit.currentValue,
      });
    }
  }, [goalToEdit, reset]);

  const onSubmit = (data: FormValues) => {
    onProgressSubmitted(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="currentValue">New Progress ({goalToEdit.unit})</Label>
        <Input 
            id="currentValue" 
            type="number" 
            {...register('currentValue')} 
            placeholder={`e.g., ${goalToEdit.currentValue}`}
            className="text-base"
        />
        {errors.currentValue && <p className="text-destructive text-sm">{errors.currentValue.message}</p>}
        <p className="text-sm text-muted-foreground">Target: {goalToEdit.targetValue} {goalToEdit.unit}</p>
      </div>

      <Button type="submit" className="w-full mt-4" size="lg">Update Progress</Button>
    </form>
  );
}
