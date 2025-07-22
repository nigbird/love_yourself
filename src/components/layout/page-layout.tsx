
'use client';

import { BackButton } from "./back-button";
import type { ReactNode } from "react";
import { usePathname } from 'next/navigation';

interface PageLayoutProps {
    children: ReactNode;
    showBackButton?: boolean;
}

export function PageLayout({ children, showBackButton = true }: PageLayoutProps) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const shouldShowButton = !isHomePage && showBackButton;

    return (
        <div className="flex flex-col items-center w-full">
            {shouldShowButton && (
                <div className="w-full max-w-5xl mb-4 -ml-2">
                    <BackButton />
                </div>
            )}
            {children}
        </div>
    );
}
