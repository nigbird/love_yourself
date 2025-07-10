import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
