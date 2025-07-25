
'use server';

import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

async function getAuthenticatedUser(idToken: string) {
    if (!idToken) {
        return null;
    }
    
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.uid },
        });
        return user;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}


export async function getUserRewardPoints(idToken: string) {
    const user = await getAuthenticatedUser(idToken);
    if (!user) {
        return 0;
    }
    
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { rewardPoints: true }
    });

    if (!dbUser) {
        return 0;
    }
    return dbUser.rewardPoints;
}

export async function getAuthenticatedUserProfile(idToken: string) {
    const user = await getAuthenticatedUser(idToken);
    if (!user) {
        return null;
    }
    return user;
}
