import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const template = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
try {
  await writeFile(new URL('../.env', import.meta.url), template.replace('CHAT_TOKEN_SECRET=', `CHAT_TOKEN_SECRET=${randomBytes(32).toString('base64')}`), { flag: 'wx', mode: 0o600 });
  console.log('.env dibuat dengan secret token acak. Isi GEMINI_API_KEY untuk mengaktifkan AI.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env sudah ada; tidak diubah.');
}
