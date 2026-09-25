import { defineCollection, z } from 'astro:content';

// Each entry in this collection is one exhibition/series (e.g. "FLOW").
// Title/description are localized objects so the Work pages can render
// the right language without a separate content file per locale.
//
// Images: drop full-resolution originals into
//   src/assets/work/<slug>/
// using any filenames — the series page picks them all up automatically
// via import.meta.glob, sorted alphabetically. No manual list to maintain.

const localizedString = z.object({
  en: z.string(),
  fr: z.string(),
  ja: z.string(),
  es: z.string(),
  zh: z.string(),
});

// Per-image caption info for the click-to-enlarge lightbox, keyed by the
// image's exact filename (e.g. "flow-01.jpg") as it appears in
// src/assets/work/<slug>/. All fields are optional — an image with no
// entry here still shows in the lightbox, just without a caption.
const imageDetail = z.object({
  title: z.string().optional(),
  printSize: z.string().optional(), // e.g. "40 × 60 cm" or "16 × 24 in"
  printSize2: z.string().optional(),
  editionSize: z.string().optional(), // e.g. "Edition of 15"
  editionSize2: z.string().optional(),
  printType: z.string().optional(), // e.g. "Pigment" or "Silver Gelatin"
});

const series = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(), // must match the folder name under src/assets/work/
    year: z.string(),
    title: localizedString,
    subtitle: localizedString,
    description: localizedString,
    descriptionCredit: localizedString.optional(),
    featured: z.boolean().default(false), // shown as the homepage hero exhibition
    order: z.number().default(0), // lower = appears first on the Work index
    imageDetails: z.record(imageDetail).default({}),
  }),
});

export const collections = { series };
