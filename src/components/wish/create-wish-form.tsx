
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Wish } from '@/domain/entities';
import { useEffect, useRef, useState } from 'react';
import { ImageUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../auth/auth-provider';
import { storage } from '@/lib/firebase/client';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  note: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWishFormProps {
  onWishSubmitted: (data: Omit<Wish, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  wishToEdit?: Wish;
}

function CreateWishForm({ onWishSubmitted, wishToEdit }: CreateWishFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
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
      setImagePreview(wishToEdit.imageUrl || null);
      setImageFile(null);
    } else {
      reset({
        title: '',
        note: '',
        imageUrl: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [wishToEdit, reset]);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) { // 30MB limit
          toast({
              title: "Image Too Large",
              description: "Image size cannot exceed 30MB.",
              variant: "destructive"
          });
          return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    let finalImageUrl = wishToEdit?.imageUrl || '';

    try {
      if (imageFile && user) {
        toast({ title: "Uploading image...", description: "Please wait a moment." });
        const imageStorageRef = storageRef(storage, `wishes/${user.uid}/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageStorageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      } else if (imageFile && !user) {
        toast({ title: "Authentication Error", description: "You must be logged in to upload images.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      const submissionData = { ...data, imageUrl: finalImageUrl };
      await onWishSubmitted(submissionData);

    } catch (error) {
      console.error("Failed to save wish", error);
      toast({ title: "Error", description: "Could not save the wish. Check the console for details.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
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
        <input type="file" ref={fileInputRef} onChange={handleImageFileChange} className="hidden" accept="image/*" />
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 rounded-md max-h-40 w-auto mx-auto" />}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" {...register('note')} placeholder="A short description of your wish..." />
        {errors.note && <p className="text-destructive text-sm">{errors.note.message}</p>}
      </div>

      <Button type="submit" className="w-full mt-4" size="lg" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Wish
      </Button>
    </form>
  );
}

export default CreateWishForm;
