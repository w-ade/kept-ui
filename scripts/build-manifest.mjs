// Builds src/manifest.json from the Base UI docs page.mdx files
// (title, subtitle and demo order with section headings).
// Usage: node scripts/build-manifest.mjs <path-to-base-ui>/docs/src/app/(docs)/react/components
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
const demosDir = path.resolve('src/demos');
const pages = [];

for (const slug of fs.readdirSync(demosDir).sort()) {
  const mdxPath = path.join(src, slug, 'page.mdx');
  if (!fs.existsSync(mdxPath)) continue;
  const lines = fs.readFileSync(mdxPath, 'utf8').split('\n');
  const title = lines.find((l) => l.startsWith('# '))?.slice(2).trim() ?? slug;
  const subtitle = lines.join('\n').match(/<Subtitle>([\s\S]*?)<\/Subtitle>/)?.[1].trim() ?? '';
  const demos = [];
  let heading = null;
  for (const line of lines) {
    const h = line.match(/^#{2,3} (.+)/);
    if (h) heading = h[1].trim();
    const m = line.match(/from '\.\/demos\/([\w-]+)'/);
    if (m && fs.existsSync(path.join(demosDir, slug, m[1], 'css-modules/index.tsx'))) {
      if (!demos.some((d) => d.id === m[1])) demos.push({ id: m[1], heading: m[1] === 'hero' ? null : heading });
    }
  }
  pages.push({ slug, title, subtitle, demos });
}

fs.writeFileSync('src/manifest.json', JSON.stringify(pages, null, 2) + '\n');
console.log(`${pages.length} pages, ${pages.reduce((n, p) => n + p.demos.length, 0)} demos`);
