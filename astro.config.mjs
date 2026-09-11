import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kasstacker.org',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // internal artboard for the OG card render — not a page
      filter: (page) => !page.includes('/internal/'),
    }),
  ],
});
