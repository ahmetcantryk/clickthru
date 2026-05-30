'use client';

import * as React from 'react';
import { cn } from '../lib/cn';

export interface HotspotProps {
  /** Oransal konum 0–1 (CLAUDE.md §5). */
  x: number;
  y: number;
  /** Merkez nokta çapı (px). */
  size?: number;
  /** Renk (verilmezse marka mavisi). */
  color?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Her zaman nabız atan hotspot — 2 iç içe **içi boş** halka pulse eder;
 * hover'da merkez **dolu** olur.
 */
export function Hotspot({ x, y, size = 16, color, className, onClick }: HotspotProps) {
  const [hover, setHover] = React.useState(false);
  const c = color ?? '#2142E7';
  const ring = size * 1.9;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="hotspot"
      className={cn('absolute z-20 -translate-x-1/2 -translate-y-1/2 outline-none', className)}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
    >
      <span className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>
        {/* dış içi boş halka — pulse */}
        <span
          className="absolute rounded-full border-2 animate-pulse-soft"
          style={{ width: ring, height: ring, borderColor: c }}
        />
        {/* iç içi boş halka — pulse (staggered) */}
        <span
          className="absolute rounded-full border-2 animate-pulse-soft"
          style={{ width: size, height: size, borderColor: c, animationDelay: '0.5s' }}
        />
        {/* merkez — default boş, hover'da dolu */}
        <span
          className="relative rounded-full transition-all duration-200"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            background: hover ? c : 'transparent',
            boxShadow: hover ? `0 0 10px ${c}` : 'none',
          }}
        />
      </span>
    </button>
  );
}
