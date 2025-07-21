
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { RedeemableReward } from '@prisma/client';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  description: z.string().optional(),
  cost: z.coerce.number().int().min(1, 'Cost must be at least 1 point.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateRewardFormProps {
  onRewardSubmitted: (data: Omit<RedeemableReward, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isEnabled'>) => void;
  rewardToEdit?: RedeemableReward;
}

export default function CreateRewardForm({ onRewardSubmitted, rewardToEdit }: CreateRewardFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      cost: 50,
    },
  });

  useEffect(() => {
    if (rewardToEdit) {
      reset({
        title: rewardToEdit.title,
        description: rewardToEdit.description || '',
        cost: rewardToEdit.cost,
      });
    } else {
      reset({
        title: '',
        description: '',
        cost: 50,
      });
    }
  }, [rewardToEdit, reset]);

  const onSubmit = (data: FormValues) => {
    onRewardSubmitted(data as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Reward Title</Label>
        <Input id="title" {...register('title')} placeholder="e.g., A relaxing bubble bath" />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

       <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register('description')} placeholder="A short description of your reward..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost">Point Cost</Label>
        <Input id="cost" type="number" {...register('cost')} />
        {errors.cost && <p className="text-destructive text-sm">{errors.cost.message}</p>}
      </div>


      <Button type="submit" className="w-full mt-4" size="lg">Save Reward</Button>
    </form>
  );
}
