
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getUnreadNotifications, markAllNotificationsAsRead } from '@/app/notifications/actions';
import type { Notification } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAuth } from '../auth/auth-provider';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { getIdToken } = useAuth();

  const fetchNotifications = async () => {
    const token = await getIdToken();
    if (!token) {
        setNotifications([]);
        setCount(0);
        return;
    }
    const { notifications, count } = await getUnreadNotifications(token);
    setNotifications(notifications);
    setCount(count);
  };

  useEffect(() => {
    // Fetch notifications when the popover opens
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, getIdToken]);
  
  // Also fetch periodically while app is open
  useEffect(() => {
      fetchNotifications(); // initial fetch
      const interval = setInterval(fetchNotifications, 60000); // every minute
      return () => clearInterval(interval);
  }, [getIdToken]);

  const handleMarkAsRead = () => {
    startTransition(async () => {
      const token = await getIdToken();
      if (!token) return;
      await markAllNotificationsAsRead(token);
      await fetchNotifications();
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button className="relative text-muted-foreground hover:text-primary transition-colors">
                <Bell />
                {count > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {count}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-lg text-primary">Notifications</h4>
            {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAsRead} disabled={isPending}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="flex gap-3">
                  <div className='flex-shrink-0 pt-1'>
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                    {notification.url && (
                        <Button variant="link" asChild className="h-auto p-0 mt-1 text-sm">
                            <Link href={notification.url} onClick={() => setIsOpen(false)}>View details</Link>
                        </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                You're all caught up!
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
