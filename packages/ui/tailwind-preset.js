// clickthru tasarım token'ları — TEK kaynak (CLAUDE.md §6).
// Cool-neutral teknik editör paleti; mavi accent. Dark + Light tema.
// Renkler CSS değişkenlerine (oklch bileşenleri) bağlanır → tema [data-theme] ile çevrilir.
// Değişkenler `apps/web/src/app/globals.css` içinde light/dark için tanımlanır.
// Bileşenler değişmeden çalışır: bg-surface / text-ink / bg-accent / border-hairline … hepsi tema-duyarlı.

/** oklch(var(--x) / <alpha-value>) — Tailwind opaklık modifikatörlerini (/50 vb.) korur. */
const c = (v) => `oklch(var(${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // editör zemini ("pit" çevresi) — uygulama arka planı
        canvas: c('--bg'),
        surface: {
          DEFAULT: c('--panel'), // paneller / kartlar / üst bar
          subtle: c('--panel-2'), // inputlar / hafif dolgular
          raised: c('--panel-3'), // hover dolgu / stepper
          elevated: c('--elev'), // popover / dock / dropdown
          pit: c('--pit'), // tuval kuyusu (canvas well)
        },
        ink: {
          DEFAULT: c('--text'),
          muted: c('--text-2'),
          faint: c('--text-3'),
        },
        // primary — tasarımın mavisi (oklch ~256). on-accent = accent üstü metin.
        accent: {
          DEFAULT: c('--accent'),
          foreground: c('--on-accent'),
          strong: c('--accent-2'),
          blue: c('--accent'),
          purple: c('--accent'),
          muted: 'oklch(var(--accent) / 0.12)',
          ring: 'oklch(var(--accent) / 0.40)',
        },
        hairline: {
          DEFAULT: 'oklch(var(--line) / <alpha-value>)',
          strong: 'oklch(var(--line-2) / <alpha-value>)',
        },
        // durum renkleri
        success: { DEFAULT: c('--good'), soft: 'oklch(var(--good) / 0.14)' },
        danger: { DEFAULT: c('--bad'), soft: 'oklch(var(--bad) / 0.14)' },
        warn: { DEFAULT: c('--warn'), soft: 'oklch(var(--warn) / 0.16)' },
      },
      backgroundImage: {
        // primary buton/hotspot/callout — düz accent (gradient yok, §10)
        'accent-grad': 'linear-gradient(0deg, oklch(var(--accent)), oklch(var(--accent)))',
      },
      fontFamily: {
        sans: ['var(--font-hanken)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: 'var(--shadow)',
        'soft-sm': 'var(--shadow-sm)',
        glow: '0 10px 30px -8px oklch(var(--accent) / 0.42)',
      },
      transitionTimingFunction: {
        scene: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'hotspot-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.18)', opacity: '0.4' },
        },
      },
      animation: {
        'hotspot-ring': 'hotspot-ring 1.6s cubic-bezier(0.22, 0.61, 0.36, 1) infinite',
        'pulse-soft': 'pulse-soft 1.7s ease-in-out infinite',
      },
    },
  },
};
