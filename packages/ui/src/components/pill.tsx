import * as React from 'react';
import { cn } from '../lib/cn';

/** Accent-tintli chip — canlı mor vurgu. */
export function Pill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1 text-xs font-medium text-accent',
        className,
      )}
      {...props}
    />
  );
}
