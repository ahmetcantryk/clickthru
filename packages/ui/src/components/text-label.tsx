import * as React from 'react';
import { cn } from '../lib/cn';

export type TextLabelSize = 'sm' | 'md' | 'lg';

export interface TextLabelStyle {
  radius?: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface TextLabelProps {
  text: string;
  /** Oransal konum 0–1 (sol-üst köşe bu noktaya oturur). */
  x: number;
  y: number;
  size?: TextLabelSize;
  /** Opsiyonel metin rengi (verilmezse tema ink). */
  color?: string;
  style?: TextLabelStyle;
  className?: string;
}

const sizeClasses: Record<TextLabelSize, string> = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1.5',
  lg: 'text-lg font-semibold px-3 py-2',
};

/** Serbest konumlu metin/etiket overlay — radius/arka plan/kenarlık ayarlanabilir. */
export function TextLabel({ text, x, y, size = 'md', color, style, className }: TextLabelProps) {
  const boxStyle: React.CSSProperties = {
    color,
    borderRadius: style?.radius,
    background: style?.bg,
    borderColor: style?.borderColor,
    borderWidth: style?.borderWidth,
  };
  return (
    <div className="absolute z-30" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
      <span
        className={cn(
          'inline-block rounded-lg border border-hairline bg-surface/90 font-medium text-ink shadow-soft backdrop-blur-sm',
          sizeClasses[size],
          className,
        )}
        style={boxStyle}
      >
        {text}
      </span>
    </div>
  );
}
