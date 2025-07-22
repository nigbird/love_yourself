
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function BackButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Back to Home</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
