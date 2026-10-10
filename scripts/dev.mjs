import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');
const run = (args) => new Promise((resolvePromise, reject) => {
  const child = spawn(process.execPath, args, { stdio: 'inherit' });
  child.on('error', reject);
  child.on('exit', (code) => code === 0 ? resolvePromise() : reject(new Error('Persiapan aplikasi gagal.')));
});
await run(['scripts/build.mjs']);
if (!existsSync(resolve(process.env.DATABASE_PATH || 'database/personality.sqlite'))) await run(['database/seed.js']);
const child = spawn(process.execPath, ['--watch', 'src/server.js'], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code || 0; });
