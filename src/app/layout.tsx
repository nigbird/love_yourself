
'use client';

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Alegreya, Inter, Lora, Roboto } from "next/font/google";
import { AppLayout } from "@/components/layout/app-layout";
import { ReminderProvider } from "@/components/reminders/reminder-provider";
import { SettingsProvider, useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ['400', '700'],
  display: "swap",
  variable: "--font-roboto",
});

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
});

function AppBody({ children }: { children: React.ReactNode }) {
  const { darkMode, textSize, font } = useSettings();
  
  const fontVariables = [
    alegreya.variable,
    inter.variable,
    roboto.variable,
    lora.variable
  ].join(' ');

  return (
    <html lang="en" suppressHydrationWarning className={cn(fontVariables, { 'dark': darkMode })}>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;700&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('antialiased', font, textSize)}>
        <ReminderProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </ReminderProvider>
        <Toaster />
      </body>
    </html>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Metadata can't be in a client component, so we wrap the body
  return (
    <SettingsProvider>
       <AppBody>{children}</AppBody>
    </SettingsProvider>
  );
}

// export const metadata: Metadata = {
//   title: "Bloom Daily",
//   description: "A self-care and self-development app.",
// };
