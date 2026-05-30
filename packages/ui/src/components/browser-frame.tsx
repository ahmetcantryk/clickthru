import * as React from 'react';
import { cn } from '../lib/cn';

export type WrapperVariant = 'browser' | 'dark' | 'none';

export interface BrowserFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string;
  variant?: WrapperVariant;
}

/** Demo görüntüsünü saran çerçeve — browser (açık) / dark / none. */
export const BrowserFrame = React.forwardRef<HTMLDivElement, BrowserFrameProps>(
  ({ className, url = 'app.clickthru.demo', variant = 'browser', children, ...props }, ref) => {
    if (variant === 'none') {
      return (
        <div
          ref={ref}
          className={cn('overflow-hidden rounded-2xl border border-hairline shadow-soft', className)}
          {...props}
        >
          <div className="relative">{children}</div>
        </div>
      );
    }

    const dark = variant === 'dark';
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-2xl border shadow-soft',
          dark ? 'border-black/40 bg-[#1B1B20]' : 'border-hairline bg-surface',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'flex items-center gap-2 border-b px-4 py-2.5',
            dark ? 'border-white/10 bg-white/5' : 'border-hairline bg-surface-subtle',
          )}
        >
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div
            className={cn(
              'ml-3 flex-1 truncate rounded-md px-3 py-1 text-center text-xs',
              dark ? 'bg-black/30 text-neutral-400' : 'bg-ink/5 text-ink-faint',
            )}
          >
            {url}
          </div>
        </div>
        <div className="relative">{children}</div>
      </div>
    );
  },
);
BrowserFrame.displayName = 'BrowserFrame';
