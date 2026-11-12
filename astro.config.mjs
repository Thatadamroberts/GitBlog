import { defineConfig } from 'astro/config';

// On GitHub Pages a project site is served from /<repo>/. The deploy workflow
// sets SITE and BASE_PATH; locally both default to the root.
export default defineConfig({
  site: process.env.SITE || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
});
