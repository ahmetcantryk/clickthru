import type { Config } from 'tailwindcss';
import preset from '@clickthru/ui/tailwind-preset';

const config: Config = {
  presets: [preset as Config],
  content: [
    './src/**/*.{ts,tsx}',
    // packages/ui primitiflerinin sınıfları da taranmalı.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
