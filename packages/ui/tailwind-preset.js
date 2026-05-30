// clickthru tasarım token'ları — TEK kaynak (CLAUDE.md §6).
// Açık (beyaz) tema. Primary: #2142e7. CommonJS (web tailwind.config + PostCSS yükler).

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F6F7F9',
        },
        ink: {
          DEFAULT: '#0B0B12',
          muted: '#5B5B66',
          faint: '#8A8A94',
        },
        // primary — tek mavi: #2142e7
        accent: {
          DEFAULT: '#2142e7',
          foreground: '#FFFFFF',
          strong: '#1B38C4',
          blue: '#2142e7',
          purple: '#2142e7',
          muted: 'rgba(33, 66, 231, 0.10)',
          ring: 'rgba(33, 66, 231, 0.40)',
        },
        hairline: 'rgba(15, 15, 30, 0.08)',
      },
      backgroundImage: {
        // primary buton/hotspot/callout — düz #2142e7
        'accent-grad': 'linear-gradient(0deg, #2142e7, #2142e7)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 14px 40px -16px rgba(20, 22, 60, 0.18), 0 4px 12px -6px rgba(20, 22, 60, 0.10)',
        glow: '0 10px 30px -8px rgba(33, 66, 231, 0.45)',
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
