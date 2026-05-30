// Adım paneli ikonları — kaynak: icon.html (görsel, video, +). Tek yerden kullanılır.

export function ImageGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M15.556 4H8.444A4.444 4.444 0 0 0 4 8.444v7.112A4.444 4.444 0 0 0 8.444 20h7.112A4.444 4.444 0 0 0 20 15.556V8.444A4.444 4.444 0 0 0 15.556 4"
        vectorEffect="non-scaling-stroke"
      />
      <path d="m12.018 14.482 3.837-3.887a2 2 0 0 1 2.847 0L20 11.91" vectorEffect="non-scaling-stroke" />
      <path d="m4.45 17.492 3.85-3.9a2 2 0 0 1 2.84 0l6.03 6.11" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function VideoGlyph({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m16 9.793 3.475-2.143A1 1 0 0 1 21 8.502v6.996a1 1 0 0 1-1.525.852L16 14.207M13 5.5H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function PlusGlyph({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m-8-8h16"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
