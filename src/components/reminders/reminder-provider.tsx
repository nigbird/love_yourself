
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { getRoutinesForReminders, createReminderNotification } from '@/app/notifications/actions';
import type { Routine } from '@prisma/client';
import { useAuth } from '../auth/auth-provider';

type RoutineForReminder = Pick<Routine, 'id' | 'name' | 'frequency' | 'daysOfWeek' | 'timeOfDay' | 'remindersEnabled'> & {
    isCompletedToday: boolean;
};


export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const { soundEnabled } = useSettings();
  const { toast } = useToast();
  const { getIdToken } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const remindersSentThisSession = useRef<Set<string>>(new Set());

  // Create and preload the audio element on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.preload = 'auto';
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
        // Ensure the audio is ready before playing
        if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
            audioRef.current.play().catch(error => {
                console.error("Audio play failed:", error);
            });
        } else {
            // If not ready, attach a listener to play when it can
            const playWhenReady = () => {
                audioRef.current?.play().catch(error => console.error("Audio play failed on canplaythrough:", error));
                audioRef.current?.removeEventListener('canplaythrough', playWhenReady);
            };
            audioRef.current.addEventListener('canplaythrough', playWhenReady);
            // Also add a timeout as a fallback
            setTimeout(() => {
                audioRef.current?.removeEventListener('canplaythrough', playWhenReady);
            }, 3000);
        }
    }
  }, [soundEnabled]);

  const checkReminders = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const dayOfWeek = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const routines = await getRoutinesForReminders(token);

    for (const routine of routines) {
      if (!routine.timeOfDay || !routine.remindersEnabled || routine.isCompletedToday) {
        continue;
      }
      
      const reminderId = `${routine.id}-${today}`;
      if (remindersSentThisSession.current.has(reminderId)) {
        continue;
      }

      let shouldRemind = false;
      if (routine.frequency === 'daily') {
        shouldRemind = true;
      } else if (routine.frequency === 'weekly' && routine.daysOfWeek?.split(',').map(Number).includes(dayOfWeek)) {
        shouldRemind = true;
      }
      
      if (shouldRemind && routine.timeOfDay === currentTime) {
        try {
          await createReminderNotification(routine.id);
          remindersSentThisSession.current.add(reminderId);
          playNotificationSound();
           // Optional: Show a toast as instant feedback, though the primary mechanism is the notification center
          toast({
            title: "🔔 New Reminder!",
            description: `Check your notification center for details.`,
            variant: "info"
          });
        } catch (error) {
            console.error("Failed to create reminder notification:", error);
        }
      }
    }
  }, [playNotificationSound, toast, getIdToken]);

  useEffect(() => {
    // Check reminders immediately on load, then every minute
    checkReminders(); 
    const reminderCheckIntervalId = setInterval(checkReminders, 60000); 

    // Reset sent reminders at midnight client-time
    const resetDailyReminders = () => {
        const now = new Date();
        if(now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 30) { // check during the first 30s of midnight
            remindersSentThisSession.current.clear();
        }
    }
    const dailyResetInterval = setInterval(resetDailyReminders, 30000); // Check every 30 seconds

    return () => {
        clearInterval(reminderCheckIntervalId)
        clearInterval(dailyResetInterval);
    };
  }, [checkReminders]);

  return <>{children}</>;
}
