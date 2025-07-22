
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";
import { PageLayout } from "@/components/layout/page-layout";
import { Sun, Moon, Bell, Palette, Lock, Database, Info } from 'lucide-react';

export default function SettingsPage() {
    const { 
      soundEnabled, setSoundEnabled, 
      darkMode, setDarkMode,
      textSize, setTextSize
    } = useSettings();

    const volume = soundEnabled ? [100] : [0];
    const setVolume = (value: number[]) => {
      setSoundEnabled(value[0] > 0);
    }

  return (
    <PageLayout>
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your app experience.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Notification Preferences</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1.5 flex-grow">
                  <Label>Notification Sound</Label>
                  <p className="text-xs text-muted-foreground">Select a sound for your reminders.</p>
                </div>
                <Select defaultValue="default" disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select sound" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="zen">Zen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border p-4">
                  <div className="space-y-1.5 mb-4">
                    <Label>Volume</Label>
                    <p className="text-xs text-muted-foreground">Adjust the notification sound volume.</p>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                  />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1.5">
                  <Label>Vibration</Label>
                   <p className="text-xs text-muted-foreground">Enable vibration for notifications.</p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1.5">
                  <Label>Quiet Hours</Label>
                  <p className="text-xs text-muted-foreground">Set a Do Not Disturb period. (Coming soon)</p>
                </div>
                 <Button variant="outline" disabled>Set Hours</Button>
              </div>

            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Appearance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
               <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1.5 flex-grow flex items-center gap-4">
                    {darkMode ? <Moon/> : <Sun />}
                    <div>
                      <Label>Theme</Label>
                      <p className="text-xs text-muted-foreground">Switch between light and dark mode.</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1.5 flex-grow">
                  <Label>App Font</Label>
                  <p className="text-xs text-muted-foreground">Change the main font of the app.</p>
                </div>
                <Select defaultValue="alegreya" disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alegreya">Alegreya (Default)</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                     <SelectItem value="lora">Lora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border p-4">
                  <div className="space-y-1.5 mb-4">
                    <Label>Text Size</Label>
                     <p className="text-xs text-muted-foreground">Adjust the text size for better readability.</p>
                  </div>
                  <Select value={textSize} onValueChange={(v) => setTextSize(v as "text-sm" | "text-base" | "text-lg")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text-sm">Small</SelectItem>
                        <SelectItem value="text-base">Medium</SelectItem>
                        <SelectItem value="text-lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1.5 flex-grow">
                  <Label>Theme Color</Label>
                  <p className="text-xs text-muted-foreground">Personalize the app's accent color.</p>
                </div>
                <div className="flex gap-2">
                    <Button size="icon" className="rounded-full bg-primary" disabled></Button>
                    <Button size="icon" className="rounded-full bg-green-400" disabled></Button>
                    <Button size="icon" className="rounded-full bg-rose-400" disabled></Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
             <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Security</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1.5">
                    <Label>Enable PIN Lock</Label>
                     <p className="text-xs text-muted-foreground">Secure the app with a PIN code.</p>
                  </div>
                  <Switch disabled />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <p>Reset PIN</p>
                    <Button variant="outline" disabled>Reset</Button>
                </div>
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="item-4">
             <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Account & Data</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">user@example.com</p>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <p>Export Data</p>
                    <Button variant="outline" disabled>Export</Button>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <p className="text-destructive">Delete Account</p>
                    <Button variant="destructive" disabled>Delete</Button>
                </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
             <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">About</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <p>App Version</p>
                    <p className="text-muted-foreground">1.0.0</p>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <p>Terms of Use</p>
                    <Button variant="link" disabled>View</Button>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <p>Privacy Policy</p>
                    <Button variant="link" disabled>View</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <p>Support</p>
                    <Button variant="link" disabled>Contact Us</Button>
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PageLayout>
  );
}
