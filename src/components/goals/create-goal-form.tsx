
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Goal, MeasurableGoal } from '@/domain/entities';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(['personal_measurable', 'spiritual']),
  rewardPoints: z.coerce.number().int().min(0, 'Reward points cannot be negative.'),
  targetValue: z.coerce.number().optional(),
  currentValue: z.coerce.number().optional(),
  unit: z.string().optional(),
}).refine(data => {
    if (data.type === 'personal_measurable') {
        return data.targetValue !== undefined && data.currentValue !== undefined && data.unit !== undefined;
    }
    return true;
}, {
    message: "Measurable goals require a target value, current value, and unit.",
    path: ["targetValue"], // you can specify which field the error belongs to
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGoalFormProps {
  onGoalSubmitted: (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  goalToEdit?: Goal | MeasurableGoal;
}

export function CreateGoalForm({ onGoalSubmitted, goalToEdit }: CreateGoalFormProps) {
  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'personal_measurable',
      rewardPoints: 50,
      targetValue: 0,
      currentValue: 0,
      unit: '',
    },
  });

  useEffect(() => {
    if (goalToEdit) {
      reset({
        name: goalToEdit.name,
        type: goalToEdit.type,
        rewardPoints: goalToEdit.rewardPoints,
        targetValue: 'targetValue' in goalToEdit ? goalToEdit.targetValue || 0 : 0,
        currentValue: 'currentValue' in goalToEdit ? goalToEdit.currentValue || 0 : 0,
        unit: 'unit' in goalToEdit ? goalToEdit.unit || '' : '',
      });
    } else {
      reset({
        name: '',
        type: 'personal_measurable',
        rewardPoints: 50,
        targetValue: 0,
        currentValue: 0,
        unit: '',
      });
    }
  }, [goalToEdit, reset]);

  const watchedType = watch('type');

  const onSubmit = (data: FormValues) => {
    onGoalSubmitted(data as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input id="name" {...register('name')} placeholder="e.g., Run a 5k" className="text-base" />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Goal Type</Label>
             <Controller
                control={control}
                name="type"
                render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="personal_measurable">Measurable</SelectItem>
                            <SelectItem value="spiritual">Spiritual</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rewardPoints">Reward Points</Label>
            <Input id="rewardPoints" type="number" {...register('rewardPoints')} />
            {errors.rewardPoints && <p className="text-destructive text-sm">{errors.rewardPoints.message}</p>}
          </div>
       </div>

      {watchedType === 'personal_measurable' && (
         <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input id="currentValue" type="number" {...register('currentValue')} />
                  {errors.currentValue && <p className="text-destructive text-sm">{errors.currentValue.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input id="targetValue" type="number" {...register('targetValue')} />
                  {errors.targetValue && <p className="text-destructive text-sm">{errors.targetValue.message}</p>}
                </div>
             </div>
             <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" {...register('unit')} placeholder="e.g., kg, pages, days" />
                {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
             </div>
         </div>
      )}

      <Button type="submit" className="w-full mt-4" size="lg">Save Goal</Button>
    </form>
  );
}
