
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Alegreya } from "next/font/google";
import { ReminderProvider } from "@/components/reminders/reminder-provider";
import { SettingsProvider } from "@/hooks/use-settings";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppClientLayout } from "@/components/layout/app-client-layout";

export const metadata: Metadata = {
  title: "Bloom Daily",
  description: "A self-care and self-development app.",
  manifest: "/manifest.json",
};

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${alegreya.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
        <meta name="application-name" content="Bloom Daily" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bloom" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <SettingsProvider>
            <ReminderProvider>
              <AppClientLayout>
                {children}
              </AppClientLayout>
            </ReminderProvider>
          </SettingsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
