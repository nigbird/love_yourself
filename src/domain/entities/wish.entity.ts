
export interface Wish {
  id: string;
  userId: string;
  title: string;
  note?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
