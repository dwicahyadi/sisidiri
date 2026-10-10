import { readFile, writeFile, mkdir } from 'node:fs/promises';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { homeMarkup } from '../public/js/home.js';

const input = new URL('../styles/app.css', import.meta.url);
const output = new URL('../public/assets/app.css', import.meta.url);
await mkdir(new URL('../public/assets/', import.meta.url), { recursive: true });
const index = new URL('../public/index.html', import.meta.url);
const html = await readFile(index, 'utf8');
await writeFile(index, html.replace(/<!--app-home-->[\s\S]*?<!--\/app-home-->/, `<!--app-home-->${homeMarkup()}<!--/app-home-->`));
const result = await postcss([tailwind({ optimize: true })]).process(await readFile(input, 'utf8'), {
  from: input.pathname, to: output.pathname, map: false,
});
await writeFile(output, result.css);
console.log('CSS siap: public/assets/app.css');
