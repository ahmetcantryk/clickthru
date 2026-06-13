// clickthru uzantısı derleyici — esbuild.
// SW (background) ESM modül; content, popup & offscreen klasik (iife) script.
import * as esbuild from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';

const common = { bundle: true, target: 'chrome116', logLevel: 'info', sourcemap: false };

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

await Promise.all([
  esbuild.build({ ...common, entryPoints: ['src/background.ts'], outfile: 'dist/background.js', format: 'esm' }),
  esbuild.build({ ...common, entryPoints: ['src/content.ts'], outfile: 'dist/content.js', format: 'iife' }),
  esbuild.build({ ...common, entryPoints: ['src/popup.ts'], outfile: 'dist/popup.js', format: 'iife' }),
  esbuild.build({ ...common, entryPoints: ['src/offscreen.ts'], outfile: 'dist/offscreen.js', format: 'iife' }),
]);

await copyFile('manifest.json', 'dist/manifest.json');
await copyFile('src/popup.html', 'dist/popup.html');
await copyFile('src/offscreen.html', 'dist/offscreen.html');

console.log('✓ Uzantı derlendi → apps/extension/dist (Chrome: Load unpacked)');
