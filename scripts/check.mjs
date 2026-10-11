import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]));
  return nested.flat();
}
const all = ['app.js', ...(await Promise.all(['src', 'database', 'scripts', 'public/js', 'tests'].map(files))).flat().filter((path) => /\.(js|mjs)$/.test(path))];
for (const file of all) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Syntax valid: ${all.length} files.`);
