import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

import react from '@astrojs/react';
import { remarkPlaceholders } from './src/lib/placeholders.mjs';

// `astro dev` — draft-copy markers ([TODO …], [VERIFY]) render as visible badges
const isDev = process.argv.includes('dev');

export default defineConfig({
  // Used for absolute URLs (canonical, og:image)
  site: 'https://bradbaumi.com.au',

  // This tells Astro to build a server-side app for Netlify
  output: 'server',

  adapter: netlify(),
  integrations: [react()],

  // The original Calibration System case study was replaced by the
  // long-form Calibration Software page.
  redirects: {
    '/work/case-study': '/work/calibration-software/',
  },

  markdown: {
    remarkPlugins: [[remarkPlaceholders, { enabled: isDev }]],
  },
});
