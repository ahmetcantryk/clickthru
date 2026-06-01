/** clickthru kıvılcım logosu (tek renk, currentColor). */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 15" fill="currentColor" className={className} aria-hidden>
      <path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" />
    </svg>
  );
}
