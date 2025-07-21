
'use server';

import { prisma } from '@/lib/db';

export async function getUserRewardPoints() {
    const user = await prisma.user.findUnique({
        where: { email: 'user@example.com' },
        select: { rewardPoints: true }
    });

    if (!user) {
        // Handle case where user is not found, maybe return 0 or throw error
        return 0;
    }
    return user.rewardPoints;
}
