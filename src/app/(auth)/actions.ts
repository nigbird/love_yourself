
'use server';

import { prisma } from '@/lib/db';

interface CreatePrismaUserPayload {
  id: string;
  email: string;
  name: string;
}

export async function createPrismaUser(payload: CreatePrismaUserPayload) {
  const { id, email, name } = payload;
  
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (existingUser) {
    // Optionally update user info if they re-register
    return existingUser;
  }

  const user = await prisma.user.create({
    data: {
      id,
      email,
      name,
    },
  });

  return user;
}
