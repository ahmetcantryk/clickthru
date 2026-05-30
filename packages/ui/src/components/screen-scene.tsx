import * as React from 'react';
import { cn } from '../lib/cn';

export interface ScreenSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sahne arka planı (hex veya css renk). CLAUDE.md §5 background. */
  background?: string;
}

/**
 * Sahne — **düz tek renk** zemin + hafif noise + soft shadow (gradient aura YOK; kullanıcı talebi).
 * Renkli gradient mesh kaldırıldı; arka plan `background` ile gelen düz renktir.
 */
export const ScreenScene = React.forwardRef<HTMLDivElement, ScreenSceneProps>(
  ({ className, background, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-hairline',
          'p-[clamp(24px,6%,96px)]',
          className,
        )}
        style={{ background: background ?? '#FFFFFF', ...style }}
        {...props}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04] mix-blend-multiply"
          aria-hidden
        />
        <div className="relative z-10 w-full max-w-5xl">{children}</div>
      </div>
    );
  },
);
ScreenScene.displayName = 'ScreenScene';
