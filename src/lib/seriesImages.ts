// Loads images from folders under src/assets/ by eagerly globbing them at
// build time. Drop new files into the relevant folder (any names) and they
// appear automatically — nothing else to wire up. Sorted alphabetically, so
// prefixing files with numbers (01-, 02-, ...) controls display order.

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

const worldOrder = ["Timeless Travel.jpg", "Cloth & Wind.jpg", "Extended Thoughts.jpg", "Family Time.jpg", "Human Vibration.jpg", "Mach Girl.jpg", "River of Life.jpg", "Sweet Dreams.jpg", "Shadow Hours.jpg", "Weight of History.jpg", "Space Time.jpg", "Cloud Swept.jpg"];

function fromGlob(glob: Record<string, { default: ImageMetadata }>, matchSegment: string): LoadedImage[] {
  return Object.entries(glob)
    .filter(([path]) => path.includes(matchSegment))
    .sort(([a], [b]) => {
      if (a.includes('/work/world/') && b.includes('/work/world/')) {
        const ai = worldOrder.indexOf(a.split('/').pop()!);
        const bi = worldOrder.indexOf(b.split('/').pop()!);
        if (ai >= 0 && bi >= 0) return ai - bi;
      }
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
