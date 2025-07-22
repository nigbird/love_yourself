
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { soundEnabled, setSoundEnabled } = useSettings();
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
    <PageLayout>
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your application preferences.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive reminders and alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="sound-notifications" className="text-base">
                  Sound Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Play a sound when a reminder notification appears.
                </p>
              </div>
              <Switch
                id="sound-notifications"
                aria-label="Toggle sound notifications"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly progress summary via email. (Coming soon)
                </p>
              </div>
              <Switch
                id="email-notifications"
                aria-label="Toggle email notifications"
                disabled
              />
            </div>
          </CardContent>
        </Card>

         <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
                <p>Log out of your account</p>
                <Button variant="destructive" onClick={handleLogout}>Log out</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
