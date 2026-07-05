import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ronmeck.dev',
  base: '/',
  integrations: [
    mdx(),
    sitemap(),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: { format: 'directory' },
  redirects: {
    '/contact': '/#contact',
    // Retired index pages — homepage sections replace them; detail pages
    // under /work/* and /patents/* live on.
    '/work': '/#work',
    '/patents': '/#patents',
  },
});
