import { readdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
const catalog = [];
for (const collection of ["form", "flow", "flight", "world"]) {
  const data = JSON.parse(
    await readFile(`src/content/series/${collection}.json`, "utf8"),
  );
  for (const filename of (await readdir(`src/assets/work/${collection}`))
    .filter((n) => /\.(jpe?g|png)$/i.test(n))
    .sort()) {
    const detail = data.imageDetails?.[filename] || {},
      meta = await sharp(
        `src/assets/work/${collection}/${filename}`,
      ).metadata();
    const formats = [];
    for (const [key, suffix, label] of [
      ["standard", "", "Standard Format"],
      ["large", "2", "Large Format"],
    ]) {
      const match = detail["printSize" + suffix]?.match(
          /([\d.]+)\s*[x×]\s*([\d.]+)/i,
        ),
        count = detail["editionSize" + suffix]?.match(/^\s*(\d+)/);
      if (!match || !count) continue;
      const a = +match[1],
        b = +match[2];
      const width = meta.width > meta.height ? Math.max(a, b) : Math.min(a, b),
        height = meta.width > meta.height ? Math.min(a, b) : Math.max(a, b);
      formats.push({
        key,
        label,
        width,
        height,
        edition: +count[1],
        editionLabel: detail["editionSize" + suffix],
      });
    }
    catalog.push({
      id: collection + "/" + filename,
      collection,
      filename,
      title: detail.title || filename.replace(/\.[^.]+$/, ""),
      printType: detail.printType || "",
      formats,
    });
  }
}
await writeFile(
  "src/data/edition-catalog.mjs",
  "// Generated from collection metadata and image orientation. Prices are never stored here.\nexport default " +
    JSON.stringify(catalog, null, 2) +
    ";\n",
);
