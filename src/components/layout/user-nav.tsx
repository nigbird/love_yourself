
'use client';

import { LogOut, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';

export function UserNav() {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged out successfully.' });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ title: 'Logout Failed', description: 'Could not log you out.', variant: 'destructive' });
    }
  };

  return (
    <TooltipProvider>
        <div className="flex items-center gap-4">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                    <Settings/>
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Settings</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <button onClick={handleLogout} className="text-muted-foreground hover:text-primary transition-colors">
                    <LogOut />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Logout</p>
                </TooltipContent>
            </Tooltip>
        </div>
    </TooltipProvider>
  );
}
