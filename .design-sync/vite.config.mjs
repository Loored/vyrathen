import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: false,
  plugins: [react(), { name: 'production-font-links', transformIndexHtml: html => html.replace('</head>', (readFileSync(new URL('../index.html', import.meta.url), 'utf8').match(/<link[^>]+>/g) ?? []).join('') + '</head>') }],
  resolve: { alias: { vyrathen: fileURLToPath(new URL('./entry.tsx', import.meta.url)) } },
  build: { outDir: '.cache/site', rollupOptions: { input: fileURLToPath(new URL('./catalog.html', import.meta.url)) } },
});
