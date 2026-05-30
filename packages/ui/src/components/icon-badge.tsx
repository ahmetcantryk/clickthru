import * as React from 'react';
import { cn } from '../lib/cn';

export function IconBadge({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl bg-accent-muted text-accent',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
