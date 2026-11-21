import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

import react from '@astrojs/react';

export default defineConfig({
  // Used for absolute URLs (canonical, og:image)
  site: 'https://bradbaumi.com.au',

  // This tells Astro to build a server-side app for Netlify
  output: 'server',

  adapter: netlify(),
  integrations: [react()],
});