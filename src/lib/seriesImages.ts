// Loads images from folders under src/assets/ by eagerly globbing them at
// build time. Drop new files into the relevant folder (any names) and they
// appear automatically. Saved collection sequences take priority; new images
// append alphabetically until placed with the private collection editor.
import collectionOrder from "../data/collection-order.json";

export interface LoadedImage {
  image: ImageMetadata;
  filename: string; // original filename, e.g. "flow-01.jpg" — used to look
  // up captions (e.g. a series' imageDetails in content/config.ts)
  assetPath: string; // path below src/assets, used for responsive display files
}

const allWorkImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/work/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
  { eager: true }
);

const allAboutImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/about/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
  { eager: true }
);

const savedOrders: Record<string, string[]> = collectionOrder;

function fromGlob(glob: Record<string, { default: ImageMetadata }>, matchSegment: string): LoadedImage[] {
  return Object.entries(glob)
    .filter(([path]) => path.includes(matchSegment))
    .sort(([a], [b]) => {
      const slug = matchSegment.split('/').filter(Boolean).pop()!;
      const order = savedOrders[slug] || [];
      const ai = order.indexOf(a.split(matchSegment)[1]!);
      const bi = order.indexOf(b.split(matchSegment)[1]!);
      if (ai >= 0 || bi >= 0) return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi);
      return a.localeCompare(b);
    })
    .map(([path, mod]) => ({
      image: mod.default,
      filename: path.split('/').pop()!,
      assetPath: path.split('/src/assets/')[1]!,
    }));
}

/** All images inside src/assets/work/<slug>/ for one exhibition/series. */
export function getSeriesImages(slug: string): LoadedImage[] {
  return fromGlob(allWorkImages, `/work/${slug}/`);
}

/** All images inside src/assets/about/ — used on the About page. */
export function getAboutImages(): LoadedImage[] {
  return Object.entries(allAboutImages)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => ({
      image: mod.default,
      filename: path.split('/').pop()!,
      assetPath: path.split('/src/assets/')[1]!,
    }));
}
