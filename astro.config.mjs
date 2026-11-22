import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { remarkPlaceholders } from './src/lib/placeholders.mjs';
import { rehypeLazyImages } from './src/lib/lazyImages.mjs';

// `astro dev` — draft-copy markers ([TODO …], [VERIFY]) render as visible badges
const isDev = process.argv.includes('dev');

export default defineConfig({
  // Used for absolute URLs (canonical, og:image)
  site: 'https://bradbaumi.com.au',

  // This tells Astro to build a server-side app for Netlify
  output: 'server',

  adapter: netlify(),
  integrations: [
    react(),
    sitemap({
      // Only the public portfolio; the planner app and auth pages stay out.
      filter: (page) =>
        !/^\/(planner|login|forgot-password|auth|SignOut|api)(\/|$)/i.test(new URL(page).pathname),
    }),
  ],

  // The original Calibration System case study was replaced by the
  // long-form Calibration Software page.
  redirects: {
    '/work/case-study': '/work/calibration-software/',
  },

  markdown: {
    remarkPlugins: [[remarkPlaceholders, { enabled: isDev }]],
    rehypePlugins: [rehypeLazyImages],
  },
});
