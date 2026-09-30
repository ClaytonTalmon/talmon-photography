import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';
async function walk(dir) {
 const rows=await readdir(dir,{withFileTypes:true});
 return (await Promise.all(rows.map(x=>x.isDirectory()?walk(join(dir,x.name)):join(dir,x.name)))).flat();
}
const files=await walk('dist');
// Astro imports can emit a fallback copy. Keep those copies display-sized too.
let resized=0;
for (const file of files.filter(f=>/\.(jpe?g|png|webp)$/i.test(f))) {
 const input=await readFile(file), meta=await sharp(input,{failOn:'none'}).metadata();
 if (Math.max(meta.width||0,meta.height||0)<=2000) continue;
 let pipeline=sharp(input,{failOn:'none'}).rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true});
 const ext=extname(file).toLowerCase();
 pipeline=ext==='.png'?pipeline.png():ext==='.webp'?pipeline.webp({quality:88}):pipeline.jpeg({quality:88,mozjpeg:true});
 await writeFile(file,await pipeline.toBuffer()); resized++;
}
const urls=files.filter(f=>f.endsWith('/index.html')&&!/\/(editions-editor|editions|mailing-list)\//.test(f)).map(f=>{
 const path=f.slice(4,-10);
 const host=/\/(editions|mailing-list)\//.test(path)?'https://willowy-pika-c392c9.netlify.app':'https://talmonphoto.com';
 return `<url><loc>${host}${path}</loc></url>`;
});
await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.join('')+'</urlset>\n');
console.log(`Finalized ${urls.length} sitemap URLs and ${resized} display-sized fallback images.`);
