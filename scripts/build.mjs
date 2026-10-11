import { readFile, writeFile, mkdir } from 'node:fs/promises';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { renderPage, siteSettings, robots, sitemap } from '../src/web/render.js';
import { routes } from '../public/js/seo.js';

const input = new URL('../styles/app.css', import.meta.url);
const output = new URL('../public/assets/app.css', import.meta.url);
await mkdir(new URL('../public/assets/', import.meta.url), { recursive: true });
const index = new URL('../public/index.html', import.meta.url);
const html = await readFile(index, 'utf8');
const settings = siteSettings();
for (const path of Object.keys(routes)) {
  const file = path === '/' ? index : new URL(`../public${path}.html`, import.meta.url);
  await writeFile(file, renderPage(path, settings, html));
}
await writeFile(new URL('../public/robots.txt', import.meta.url), robots(settings));
await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap(settings));
const result = await postcss([tailwind({ optimize: true })]).process(await readFile(input, 'utf8'), {
  from: input.pathname, to: output.pathname, map: false,
});
await writeFile(output, result.css);
console.log('CSS siap: public/assets/app.css');
