import { cpus } from 'node:os';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import sharp from 'sharp';

const sourceRoot = new URL('../src/assets/', import.meta.url);
const outputRoot = new URL('../public/_images/', import.meta.url);
const widths = [640, 1200, 1800, 2400];
const supported = new Set(['.jpg', '.jpeg', '.png']);
const restoredFromCache = process.env.RESPONSIVE_CACHE_HIT === 'true';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : path;
  }));
  return files.flat();
}

const files = (await walk(sourceRoot.pathname)).filter((path) => supported.has(extname(path).toLowerCase()));
const jobs = [];

for (const input of files) {
  const metadata = await sharp(input).metadata();
  if (!metadata.width) continue;

  const relativePath = relative(sourceRoot.pathname, input);
  const outputBase = join(outputRoot.pathname, relativePath);
  await mkdir(join(outputBase, '..'), { recursive: true });

  for (const requestedWidth of widths) {
    const width = Math.min(requestedWidth, metadata.width);
    const output = `${outputBase}-${width}.webp`;
    if (jobs.some((job) => job.output === output)) continue;
    try {
      const [sourceStats, outputStats] = await Promise.all([stat(input), stat(output)]);
      if (restoredFromCache || outputStats.mtimeMs >= sourceStats.mtimeMs) continue;
    } catch {
      // Missing output: generate it below.
    }
    jobs.push({ input, output, width });
  }
}

const concurrency = Math.max(2, Math.min(4, cpus().length));
let cursor = 0;

async function worker() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    // A few legacy JPEG masters contain harmless trailing/truncation markers.
    // Browsers display them correctly, so allow libvips to decode them too.
    await sharp(job.input, { failOn: 'none' })
      .rotate()
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: 88, effort: 4, smartSubsample: true })
      .toFile(job.output);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`Prepared ${jobs.length} responsive display images from ${files.length} masters.`);
