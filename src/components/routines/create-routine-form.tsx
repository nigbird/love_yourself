
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
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Routine } from '@/domain/entities/routine.entity';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  daysOfWeek: z.array(z.number()).optional(),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  rewardPoints: z.coerce.number().int().min(0, 'Reward points cannot be negative.'),
  remindersEnabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateRoutineFormProps {
  onRoutineCreated: (data: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  routineToEdit?: Routine;
}

const weekDays = [
    { label: 'S', value: '0' },
    { label: 'M', value: '1' },
    { label: 'T', value: '2' },
    { label: 'W', value: '3' },
    { label: 'T', value: '4' },
    { label: 'F', value: '5' },
    { label: 'S', value: '6' },
];

export function CreateRoutineForm({ onRoutineCreated, routineToEdit }: CreateRoutineFormProps) {
  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      frequency: 'daily',
      daysOfWeek: [],
      timeOfDay: '08:00',
      rewardPoints: 10,
      remindersEnabled: true,
    },
  });

  useEffect(() => {
    if (routineToEdit) {
      reset({
        name: routineToEdit.name,
        frequency: routineToEdit.frequency,
        daysOfWeek: (routineToEdit.daysOfWeek as number[]) || [],
        timeOfDay: routineToEdit.timeOfDay || '08:00',
        rewardPoints: routineToEdit.rewardPoints,
        remindersEnabled: routineToEdit.remindersEnabled,
      });
    } else {
      reset({
        name: '',
        frequency: 'daily',
        daysOfWeek: [],
        timeOfDay: '08:00',
        rewardPoints: 10,
        remindersEnabled: true,
      });
    }
  }, [routineToEdit, reset]);

  const watchedFrequency = watch('frequency');

  const onSubmit = (data: FormValues) => {
    onRoutineCreated(data as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Routine Name</Label>
        <Input id="name" {...register('name')} placeholder="e.g., Morning Meditation" className="text-base" />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
             <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="frequency">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="timeOfDay">Time of Day</Label>
            <Input id="timeOfDay" type="time" {...register('timeOfDay')} />
            {errors.timeOfDay && <p className="text-destructive text-sm">{errors.timeOfDay.message}</p>}
        </div>
      </div>
      
      {(watchedFrequency === 'weekly' || watchedFrequency === 'custom') && (
         <div className="space-y-2">
            <Label>Days of the Week</Label>
            <Controller
                control={control}
                name="daysOfWeek"
                render={({ field }) => (
                    <ToggleGroup 
                        type="multiple" 
                        variant="outline" 
                        className="justify-start"
                        value={field.value?.map(String) || []}
                        onValueChange={(value) => field.onChange(value.map(Number))}
                    >
                        {weekDays.map(day => (
                            <ToggleGroupItem key={day.value} value={day.value} aria-label={`Toggle ${day.label}`}>
                                {day.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                )}
            />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="space-y-2">
          <Label htmlFor="rewardPoints">Reward Points</Label>
          <Input id="rewardPoints" type="number" {...register('rewardPoints')} />
          {errors.rewardPoints && <p className="text-destructive text-sm">{errors.rewardPoints.message}</p>}
        </div>
        <div className="flex items-center space-x-4 pt-6">
            <Label htmlFor="remindersEnabled" className="flex-shrink-0">Enable Reminders</Label>
            <Controller
                control={control}
                name="remindersEnabled"
                render={({ field }) => (
                     <Switch
                        id="remindersEnabled"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
            />
        </div>
      </div>

      <Button type="submit" className="w-full mt-4" size="lg">Save Routine</Button>
    </form>
  );
}
