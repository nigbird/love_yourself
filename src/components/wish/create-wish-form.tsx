
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Wish } from '@/domain/entities';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  note: z.string().optional(),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWishFormProps {
  onWishSubmitted: (data: Omit<Wish, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  wishToEdit?: Wish;
}

export function CreateWishForm({ onWishSubmitted, wishToEdit }: CreateWishFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      note: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (wishToEdit) {
      reset({
        title: wishToEdit.title,
        note: wishToEdit.note,
        imageUrl: wishToEdit.imageUrl,
      });
    } else {
      reset({
        title: '',
        note: '',
        imageUrl: '',
      });
    }
  }, [wishToEdit, reset]);

  const onSubmit = (data: FormValues) => {
    onWishSubmitted(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Wish Title</Label>
        <Input id="title" {...register('title')} placeholder="e.g., A trip to the Maldives" className="text-base" />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/image.png" className="text-base" />
        {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" {...register('note')} placeholder="A short description of your wish..." />
        {errors.note && <p className="text-destructive text-sm">{errors.note.message}</p>}
      </div>

      <Button type="submit" className="w-full mt-4" size="lg">Save Wish</Button>
    </form>
  );
}
