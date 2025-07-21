
'use client';

import { useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    // We need to create the audio element in the browser
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('/notification.mp3');
    }

    async function fetchData() {
      const [dbRoutines, dbStatus] = await Promise.all([
        getRoutines(),
        getCompletionStatus(),
      ]);
      setRoutines(dbRoutines.filter(r => r.remindersEnabled));
      setCompletionStatus(dbStatus);
    }
    fetchData();
  }, []);

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(error => {
            console.error("Audio play failed:", error);
            // This can happen if the user hasn't interacted with the page yet.
        });
    }
  }

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

    const intervalId = setInterval(checkReminders, 60000); // Check every minute

    // Reset sent reminders at midnight
    const resetDailyReminders = () => {
        const now = new Date();
        if(now.getHours() === 0 && now.getMinutes() === 0) {
            setRemindersSent(new Set());
        }
    }
    const dailyResetInterval = setInterval(resetDailyReminders, 60000);

    return () => {
        clearInterval(intervalId)
        clearInterval(dailyResetInterval);
    };
  }, [routines, completionStatus, toast, remindersSent, soundEnabled]);

  return <>{children}</>;
}
