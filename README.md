# Talmon de l'Armée — Photography

A fast, static, multilingual portfolio site built with [Astro](https://astro.build). No server to run or manage — it builds to plain HTML/CSS/JS that any static host can serve.

## Running it locally in VS Code

1. Install [Node.js](https://nodejs.org) (LTS version, 18 or newer) if you don't have it.
2. Open this folder in VS Code.
3. Install the recommended "Astro" extension when VS Code prompts you (or search for `astro-build.astro-vscode` in the Extensions panel) — it gives you syntax highlighting and error checking in `.astro` files.
4. Open a terminal in VS Code (`` Terminal → New Terminal ``) and run:

   ```
   npm install
   npm run dev
   ```

5. Open the URL it prints (usually `http://localhost:4321`) in your browser. The site live-reloads as you edit files.

To build the production version (the files you'd deploy):

```
npm run build
```

This outputs everything to a `dist/` folder. `npm run preview` serves that folder locally so you can double check it before deploying.

## Adding your own photographs

Images live under `src/assets/work/<series-slug>/` — one folder per exhibition/series. Drop full-resolution JPGs or PNGs straight in; **do not resize them yourself first**. Astro's build pipeline (via Sharp) automatically generates the right sizes and modern formats (AVIF, with fallbacks) for every screen, and lazy-loads anything below the fold. Bigger originals in, optimized files out — that's the point of the pipeline.

Filenames are sorted alphabetically to decide gallery order, so prefixing with numbers gives you control: `01-dune.jpg`, `02-veil.jpg`, etc.

The `FLOW` series is already wired up with your 16 images. The `FORM` and `FLIGHT` series folders (`src/assets/work/form/` and `src/assets/work/flight/`) are empty and ready — just add images there, and update that series' title/subtitle/description in `src/content/series/form.json` / `flight.json`.

## Adding photos to the About page

Drop portrait or studio photos into `src/assets/about/` (same rule as series: any filenames, full resolution, numbered prefixes control order). The first image becomes a large hero photo at the top of the About page; any additional images appear below it in a small grid. Empty folder = no images shown, no error.

## Changing the gallery layout

Open `src/pages/[locale]/work/[slug].astro` and look for the `.gallery` rule near the bottom (there are comments right above the gallery markup pointing at it too). Three things you can tweak:

- **Number of columns**: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));` fits as many columns as will comfortably hold 280px-wide images (so it reflows automatically between desktop and mobile). To force a fixed number instead — say, always 3 columns on desktop — change it to `repeat(3, 1fr)`.
- **Spacing between images**: the `gap: 4px;` line. Bigger number = more breathing room between photos.
- **Crop shape**: `aspect-ratio: 2 / 3;` on `.gallery__image` controls the thumbnail shape — `2/3` is a tall portrait crop (matches the mockup), `1/1` is square, `4/5` is a shorter portrait.

## Clicking an image to see it larger with print size and edition info

Every series page now has a lightbox: click any thumbnail and it opens full-size, centered on a dark overlay, with arrow keys / on-screen arrows to move between images and an "X" or click-outside to close.

To add the caption text (print size, edition size, and an optional title) under an enlarged image, edit that series' JSON file in `src/content/series/` and add an `imageDetails` block keyed by the exact filename:

```json
{
  "slug": "flow",
  "year": "2026",
  ...
  "imageDetails": {
    "flow-01.jpg": {
      "title": "Veil, Death Valley",
      "printSize": "40 × 60 cm",
      "editionSize": "Edition of 15"
    },
    "flow-02.jpg": {
      "printSize": "50 × 75 cm",
      "editionSize": "Edition of 10"
    }
  }
}
```

Every field is optional — leave out `title` if you don't want a caption title, and an image with no entry in `imageDetails` at all still opens in the lightbox, just without any text underneath it. This block goes at the same level as `title`/`subtitle`/`description` in the JSON file (see `flow.json` for the full structure).

## Adding a new exhibition/series

1. Create a folder: `src/assets/work/<new-slug>/` and drop images in.
2. Create `src/content/series/<new-slug>.json`, copying the structure of `flow.json` or `form.json` (title/subtitle/description per language, year, order, and whether it's `featured` — the featured one shows on the homepage hero).
3. That's it — the Work index and the series page build automatically.

## Adding or editing translations

All UI text and page copy lives in one file: `src/i18n/translations.ts`. Currently set up for English, French, and Japanese as a working example of "3+ languages" — add or remove languages there.

To add a language:

1. Add its two-letter code to the `locales` array in `astro.config.mjs`'s comment reference and in `src/i18n/translations.ts`'s `locales` array.
2. Copy the `en: { ... }` block in the `translations` object and translate every string.
3. Add a friendly label to `localeNames` (used in the language switcher).
4. Also add the language code + translated fields to each `src/content/series/*.json` file's `title`/`subtitle`/`description` objects.

Every page already loops over `locales` to generate its routes (e.g. `/en/work`, `/fr/work`, `/ja/work`), so a new language appears sitewide automatically once its translations exist.

## Turning on the contact form

The Contact page posts to [Formspree](https://formspree.io) (free tier available) — no backend of your own required.

1. Create a form at formspree.io and copy its ID (the part after `/f/` in the endpoint it gives you).
2. Copy `.env.example` to a new file named `.env` in the project root.
3. Set `PUBLIC_FORMSPREE_ID=` to that ID.
4. Restart `npm run dev` if it's running.

## Turning on the Private View password gate

The Private View page is gated by a single shared password (see the code comments in `src/pages/[locale]/private-view.astro` for the security trade-offs of this approach on a static site).

1. Pick a password.
2. Generate its SHA-256 hash. On Mac/Linux: `echo -n "your-password" | shasum -a 256`. On Windows (PowerShell): `certutil -hashfile file.txt SHA256` works on a file, or use an online SHA-256 tool if you'd rather not install anything — just don't paste your real password into a site you don't trust.
3. Put the hash (not the password) in `.env` as `PUBLIC_PRIVATE_VIEW_HASH=`.
4. Once you have real advance-work content, add it inside the `#pv-content` block in `private-view.astro`.

## Turning on analytics (visitor location + frequency)

The site ships with [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) wired up — free, cookie-free, no consent banner needed, and it reports visitor geography and visit frequency.

1. Sign up at the Cloudflare dashboard → Analytics → Web Analytics, add your site, and copy the beacon token it gives you.
2. Put it in `.env` as `PUBLIC_CF_BEACON_TOKEN=`.

Prefer Plausible or Fathom instead? Swap the script tag in `src/components/Analytics.astro` for their snippet — same idea, same "no backend" model.

## Deploying (no server to manage)

Any static host works. Netlify, Vercel, and Cloudflare Pages all offer: connect your GitHub repo → auto-deploy on every push → free tier that comfortably covers a portfolio site.

General steps (Netlify shown, others are nearly identical):

1. Push this project to a GitHub repository.
2. In Netlify: "Add new site" → "Import an existing project" → pick the repo.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Add your `.env` values (`PUBLIC_CF_BEACON_TOKEN`, `PUBLIC_FORMSPREE_ID`, `PUBLIC_PRIVATE_VIEW_HASH`) under Site settings → Environment variables.
5. Deploy. You'll get a `*.netlify.app` URL immediately, with the option to attach your own domain afterward.

Vercel and Cloudflare Pages: same idea, same build command/output folder, environment variables added in their respective dashboard's project settings.

## Project structure

```
src/
  assets/work/<slug>/     full-resolution images per series
  content/series/*.json   series metadata (title, description, year, per language)
  components/             Header, Footer, Analytics
  i18n/                   translations.ts (all copy) + routing helpers
  layouts/BaseLayout.astro
  lib/seriesImages.ts     auto-loads images for a series
  pages/
    index.astro           redirects "/" to "/en/"
    [locale]/              one folder, all languages, via getStaticPaths
      index.astro          homepage
      work/index.astro     series index
      work/[slug].astro    one series/exhibition
      studio.astro
      about.astro
      contact.astro
      private-view.astro
```

## A note on this build

This project was authored in a cloud workspace without access to the npm package registry, so it could not be `npm install`'d or build-tested there — everything was hand-written carefully against Astro's documented APIs, but you're the first to actually run `npm install && npm run dev` on it. If something doesn't compile, the error message from `astro dev` will point straight at the file and line — worth pasting back for a fix.
