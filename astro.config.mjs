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

  markdown: {
    remarkPlugins: [[remarkPlaceholders, { enabled: isDev }]],
  },
});
