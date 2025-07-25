
'use server';

import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

async function getAuthenticatedUser() {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }
    const idToken = authorization.split('Bearer ')[1];
    
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


export async function getUserRewardPoints() {
    const user = await getAuthenticatedUser();
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

