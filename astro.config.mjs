import { defineConfig, passthroughImageService } from 'astro/config';

// Build at the domain root on Netlify, and beneath the repository name
// when GitHub Pages runs the build.
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: isGitHubPages
    ? 'https://claytontalmon.github.io'
    : 'https://www.claytontalmon.com',
  base: isGitHubPages ? '/talmon-photography' : '/',
  output: 'static',

  // Preserve the supplied photographic files instead of generating hundreds
  // of duplicate responsive variants during every hosted deployment.
  image: {
    service: passthroughImageService(),
  },
});
