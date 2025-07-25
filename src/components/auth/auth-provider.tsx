
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import type { User } from '@/domain/entities';
import { getAuthenticatedUserProfile } from '@/app/user/actions';


interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function will be called by client components that need to make authorized API calls
const fetcher = async (url: string, idToken: string, options?: RequestInit) => {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...options?.headers,
            'Authorization': `Bearer ${idToken}`
        }
    });
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        try {
            error.message = (await res.json()).error || error.message;
        } catch (e) {
            // Not a JSON response
        }
        throw error;
    }
    return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };
  
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch the user profile from your backend when the user is authenticated
        const token = await user.getIdToken();
        try {
            const profile = await getAuthenticatedUserProfile();
            setDbUser(profile);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setDbUser(null);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, dbUser, loading, getIdToken }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Wrapper for client-side data fetching
export function useAuthorizedFetcher() {
    const { getIdToken } = useAuth();
    
    const authorizedFetcher = async (url: string, options?: RequestInit) => {
        const token = await getIdToken();
        if (!token) {
            throw new Error("User not authenticated.");
        }
        return fetcher(url, token, options);
    };

    return authorizedFetcher;
}
