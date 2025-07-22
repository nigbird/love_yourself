
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getRoutines, getCompletionStatus } from '@/app/routines/actions';
import type { Routine } from '@/domain/entities';
import { BellRing } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

type CompletionStatus = {
    [routineId: string]: string; // Store date string 'YYYY-MM-DD'
};

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { soundEnabled } = useSettings();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({});
  const [remindersSent, setRemindersSent] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchData = useCallback(async () => {
    // This function can now be called to refresh the data
    const [dbRoutines, dbStatus] = await Promise.all([
      getRoutines(),
      getCompletionStatus(),
    ]);
    setRoutines(dbRoutines.filter(r => r.remindersEnabled));
    setCompletionStatus(dbStatus);
  }, []);

  useEffect(() => {
    // Create the audio element on the client
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('/notification.mp3');
    }
    
    // Fetch initial data
    fetchData();

    // Set up an interval to re-fetch data periodically (e.g., every 5 minutes)
    // This ensures the provider has the latest routines and completion statuses
    const fetchDataIntervalId = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes

    return () => {
        clearInterval(fetchDataIntervalId);
    };

  }, [fetchData]);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(error => {
            console.error("Audio play failed:", error);
            // This can happen if the user hasn't interacted with the page yet.
        });
    }
  }, [soundEnabled]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const dayOfWeek = now.getDay(); // Sunday - 0, Saturday - 6
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      routines.forEach(routine => {
        if (!routine.timeOfDay) return;

        const isCompleted = completionStatus[routine.id] === today;
        if (isCompleted) return;
        
        const reminderId = `${routine.id}-${today}`;
        if (remindersSent.has(reminderId)) return;

        let shouldRemind = false;
        if (routine.frequency === 'daily') {
          shouldRemind = true;
        } else if (routine.frequency === 'weekly' && routine.daysOfWeek?.includes(dayOfWeek)) {
          shouldRemind = true;
        }

        if (shouldRemind && routine.timeOfDay === currentTime) {
          toast({
            title: 'Routine Reminder',
            description: `It's time for your "${routine.name}" routine!`,
            variant: 'info',
            action: <BellRing className="text-blue-400" />,
          });
          playNotificationSound();
          setRemindersSent(prev => new Set(prev).add(reminderId));
        }
      });
    };

    const reminderCheckIntervalId = setInterval(checkReminders, 60000); // Check every minute

    // Reset sent reminders at midnight
    const resetDailyReminders = () => {
        const now = new Date();
        if(now.getHours() === 0 && now.getMinutes() === 0) {
            setRemindersSent(new Set());
        }
    }
    const dailyResetInterval = setInterval(resetDailyReminders, 60000);

    return () => {
        clearInterval(reminderCheckIntervalId)
        clearInterval(dailyResetInterval);
    };
  }, [routines, completionStatus, toast, remindersSent, playNotificationSound]);

  return <>{children}</>;
}
