import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  // This tells Astro to build a server-side app for Netlify
  output: 'server',
  adapter: netlify(),
});