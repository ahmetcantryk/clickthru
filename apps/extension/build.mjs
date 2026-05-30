// clickthru uzantısı derleyici — esbuild.
// SW (background) ESM modül; content & popup klasik (iife) script olmalı.
import * as esbuild from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';

const common = { bundle: true, target: 'chrome114', logLevel: 'info', sourcemap: false };

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

await Promise.all([
  esbuild.build({ ...common, entryPoints: ['src/background.ts'], outfile: 'dist/background.js', format: 'esm' }),
  esbuild.build({ ...common, entryPoints: ['src/content.ts'], outfile: 'dist/content.js', format: 'iife' }),
  esbuild.build({ ...common, entryPoints: ['src/popup.ts'], outfile: 'dist/popup.js', format: 'iife' }),
]);

await copyFile('manifest.json', 'dist/manifest.json');
await copyFile('src/popup.html', 'dist/popup.html');

console.log('✓ Uzantı derlendi → apps/extension/dist (Chrome: Load unpacked)');
