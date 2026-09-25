import { defineConfig, passthroughImageService } from 'astro/config';

export default defineConfig({
  site: 'https://www.claytontalmon.com',
  base: '/',
  output: 'static',

  // Preserve the supplied photographic files instead of generating hundreds
  // of duplicate responsive variants during every hosted deployment.
  image: {
    service: passthroughImageService(),
  },
});
