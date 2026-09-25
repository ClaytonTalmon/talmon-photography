import { defineConfig, passthroughImageService } from 'astro/config';

// Talmon de l'Armée — Photography
// Static output: no server to run or manage. Deploy the `dist/` folder
// (or connect the repo) to Netlify, Vercel, or Cloudflare Pages.
//
// Language routing is handled manually via src/pages/[locale]/... using
// getStaticPaths (see src/i18n/translations.ts for the locale list) rather
// than Astro's built-in i18n router, so every route + redirect is explicit
// and easy to extend with a new language.
export default defineConfig({
  site: 'https://www.claytontalmon.com',
  base: '/',
  output: 'static',

  // Responsive display files are prepared once by the prebuild script.
  // Keep Astro from re-encoding the fine-art masters on every deployment.
  image: {
    service: passthroughImageService(),
  },
});
