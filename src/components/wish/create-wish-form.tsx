
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Wish } from '@/domain/entities';
import { useEffect, useRef } from 'react';
import { ImageUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  note: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWishFormProps {
  onWishSubmitted: (data: Omit<Wish, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  wishToEdit?: Wish;
}

function CreateWishForm({ onWishSubmitted, wishToEdit }: CreateWishFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      note: '',
      imageUrl: '',
    },
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrl = watch('imageUrl');
  const { toast } = useToast();


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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          toast({
              title: "Image Too Large",
              description: "Image size cannot exceed 2MB.",
              variant: "destructive"
          });
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imageUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Wish Title</Label>
        <Input id="title" {...register('title')} placeholder="e.g., A trip to the Maldives" className="text-base" />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Image</Label>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
            <ImageUp className="mr-2" /> Upload Image
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 rounded-md max-h-40 w-auto mx-auto" />}
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

export default CreateWishForm;
